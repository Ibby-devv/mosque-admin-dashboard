import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import { Save, Plus, Edit2, Trash2, Calendar, MapPin, Users, X, Tag } from 'lucide-react';
import { 
  collection, 
  addDoc, 
  updateDoc, 
  deleteDoc, 
  doc, 
  getDocs,
  getDoc,
  setDoc,
  query,
  orderBy,
  Timestamp 
} from 'firebase/firestore';
import { db } from '../firebase';
import { Event, EventCategory, EventCategoriesConfig } from '../types';

interface EventsTabProps {
  saving: boolean;
  onSaveStatusChange: (success: boolean) => void;
}

// Helper function to check if event is in the past
const isPastEvent = (eventDate: string): boolean => {
  const today = new Date().toLocaleString('en-AU', {
    timeZone: 'Australia/Sydney',
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  });
  const [day, month, year] = today.split('/');
  const todayFormatted = `${year}-${month}-${day}`;
  return eventDate < todayFormatted;
};

// Styled Components
const Card = styled.div`
  background: white;
  border-radius: 0.75rem;
  box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.1);
  padding: 1.5rem;
`;

const TabContainer = styled.div`
  display: flex;
  gap: 0.5rem;
  margin-bottom: 1.5rem;
  border-bottom: 2px solid #e5e7eb;
`;

const Tab = styled.button<{ $active: boolean }>`
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.75rem 1.5rem;
  border: none;
  background: none;
  cursor: pointer;
  font-weight: 600;
  color: ${props => props.$active ? '#1e3a8a' : '#6b7280'};
  border-bottom: 3px solid ${props => props.$active ? '#1e3a8a' : 'transparent'};
  margin-bottom: -2px;
  transition: all 0.2s;

  &:hover {
    color: #1e3a8a;
  }
`;

const CardTitle = styled.h2`
  font-size: 1.5rem;
  font-weight: bold;
  color: #1f2937;
  margin-bottom: 1.5rem;
`;

const ButtonGroup = styled.div`
  display: flex;
  gap: 0.75rem;
  margin-bottom: 1.5rem;
`;

const Button = styled.button<{ variant?: 'primary' | 'danger' | 'success' }>`
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.75rem 1.5rem;
  border-radius: 0.5rem;
  font-weight: 600;
  border: none;
  cursor: pointer;
  transition: all 0.2s;
  background: ${props => 
    props.variant === 'danger' ? '#dc2626' :
    props.variant === 'success' ? '#059669' :
    '#1e3a8a'
  };
  color: white;

  &:hover {
    background: ${props => 
      props.variant === 'danger' ? '#b91c1c' :
      props.variant === 'success' ? '#047857' :
      '#1e40af'
    };
  }

  &:disabled {
    background: #9ca3af;
    cursor: not-allowed;
  }
`;

const SmallButton = styled.button<{ variant?: 'primary' | 'danger' }>`
  display: flex;
  align-items: center;
  gap: 0.25rem;
  padding: 0.5rem 0.75rem;
  border-radius: 0.375rem;
  font-weight: 500;
  font-size: 0.875rem;
  border: none;
  cursor: pointer;
  transition: all 0.2s;
  background: ${props => props.variant === 'danger' ? '#dc2626' : '#1e3a8a'};
  color: white;

  &:hover {
    background: ${props => props.variant === 'danger' ? '#b91c1c' : '#1e40af'};
  }

  &:disabled {
    background: #9ca3af;
    cursor: not-allowed;
  }
`;

const EventsGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(350px, 1fr));
  gap: 1.5rem;
  margin-top: 1.5rem;
`;

const EventCard = styled.div<{ $active: boolean; $isPast: boolean }>`
  border: 1px solid ${props => 
    props.$isPast ? '#e5e7eb' : 
    props.$active ? '#10b981' : '#e5e7eb'
  };
  background: ${props => 
    props.$isPast ? '#f9fafb' : 
    props.$active ? '#f0fdf4' : '#f9fafb'
  };
  border-left: 4px solid ${props => 
    props.$isPast ? '#9ca3af' : 
    props.$active ? '#10b981' : '#e5e7eb'
  };
  border-radius: 0.75rem;
  padding: 1.25rem;
  position: relative;
  opacity: ${props => props.$isPast ? 0.6 : (props.$active ? 1 : 0.7)};
  transition: all 0.2s;

  &:hover {
    opacity: ${props => props.$isPast ? 0.7 : 1};
    box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);
  }
`;

const EventCategoryBadge = styled.span`
  display: inline-block;
  padding: 0.25rem 0.75rem;
  border-radius: 9999px;
  font-size: 0.75rem;
  font-weight: 600;
  margin-bottom: 0.75rem;
`;

const PastEventBadge = styled.span`
  display: inline-block;
  background: #fecaca;
  color: #991b1b;
  font-size: 0.75rem;
  font-weight: 600;
  padding: 0.25rem 0.5rem;
  border-radius: 0.375rem;
  margin-left: 0.5rem;
`;

const EventTitle = styled.h3`
  font-size: 1.125rem;
  font-weight: bold;
  color: #1f2937;
  margin-bottom: 0.5rem;
  display: flex;
  align-items: center;
`;

const EventDetail = styled.div`
  display: flex;
  align-items: center;
  gap: 0.5rem;
  font-size: 0.875rem;
  color: #6b7280;
  margin-bottom: 0.5rem;
`;

const EventDescription = styled.p`
  font-size: 0.875rem;
  color: #6b7280;
  margin: 0.75rem 0;
  line-height: 1.5;
`;

const EventActions = styled.div`
  display: flex;
  gap: 0.5rem;
  margin-top: 1rem;
`;

const CategoriesGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
  gap: 1rem;
  margin-top: 1.5rem;
`;

const CategoryCard = styled.div`
  border: 1px solid #e5e7eb;
  border-radius: 0.75rem;
  padding: 1.25rem;
  background: white;
  transition: all 0.2s;

  &:hover {
    box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);
  }
`;

const CategoryPreview = styled.div`
  padding: 0.75rem 1rem;
  border-radius: 0.5rem;
  text-align: center;
  font-weight: bold;
  font-size: 0.875rem;
  margin-bottom: 1rem;
`;

const CategoryLabel = styled.h4`
  font-size: 1rem;
  font-weight: 600;
  color: #1f2937;
  margin-bottom: 0.75rem;
`;

const CategoryColors = styled.div`
  display: flex;
  gap: 0.5rem;
  margin-bottom: 1rem;
`;

const ColorSwatch = styled.div`
  flex: 1;
  height: 40px;
  border-radius: 0.375rem;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 0.75rem;
  font-weight: 600;
  border: 1px solid #d1d5db;
  
  span {
    color: #fff;
    text-shadow: 0 0 2px rgba(0,0,0,0.5);
  }
`;

const CategoryActions = styled.div`
  display: flex;
  gap: 0.5rem;
  flex-wrap: wrap;
`;

const Modal = styled.div<{ $show: boolean }>`
  display: ${props => props.$show ? 'block' : 'none'};
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.5);
  z-index: 1000;
  overflow-y: auto;
`;

const ModalContent = styled.div`
  background: white;
  max-width: 42rem;
  margin: 2rem auto;
  border-radius: 1rem;
  padding: 2rem;
  position: relative;
`;

const ModalHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1.5rem;
`;

const ModalTitle = styled.h3`
  font-size: 1.5rem;
  font-weight: bold;
  color: #1f2937;
`;

const CloseButton = styled.button`
  background: none;
  border: none;
  cursor: pointer;
  padding: 0.5rem;
  color: #6b7280;
  
  &:hover {
    color: #1f2937;
  }
`;

const Form = styled.div`
  display: flex;
  flex-direction: column;
  gap: 1rem;
`;

const FormGroup = styled.div``;

const Label = styled.label`
  display: block;
  font-size: 0.875rem;
  font-weight: 600;
  color: #374151;
  margin-bottom: 0.5rem;
`;

const Input = styled.input`
  width: 100%;
  padding: 0.75rem 1rem;
  border: 1px solid #d1d5db;
  border-radius: 0.5rem;
  font-size: 1rem;
  outline: none;
  transition: all 0.2s;
  box-sizing: border-box;

  &:focus {
    border-color: #1e3a8a;
    box-shadow: 0 0 0 3px rgba(30, 58, 138, 0.1);
  }
`;

const TextArea = styled.textarea`
  width: 100%;
  padding: 0.75rem 1rem;
  border: 1px solid #d1d5db;
  border-radius: 0.5rem;
  font-size: 1rem;
  outline: none;
  transition: all 0.2s;
  box-sizing: border-box;
  min-height: 100px;
  resize: vertical;
  font-family: inherit;

  &:focus {
    border-color: #1e3a8a;
    box-shadow: 0 0 0 3px rgba(30, 58, 138, 0.1);
  }
`;

const Select = styled.select`
  width: 100%;
  padding: 0.75rem 1rem;
  border: 1px solid #d1d5db;
  border-radius: 0.5rem;
  font-size: 1rem;
  outline: none;
  transition: all 0.2s;
  box-sizing: border-box;
  background: white;

  &:focus {
    border-color: #1e3a8a;
    box-shadow: 0 0 0 3px rgba(30, 58, 138, 0.1);
  }
`;

const TwoColumnGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 1rem;
`;

const Checkbox = styled.input`
  width: 1.25rem;
  height: 1.25rem;
  cursor: pointer;
`;

const CheckboxLabel = styled.label`
  display: flex;
  align-items: center;
  gap: 0.5rem;
  font-size: 0.875rem;
  color: #374151;
  cursor: pointer;
`;

const EmptyState = styled.div`
  text-align: center;
  padding: 3rem 1rem;
  color: #6b7280;
`;

const EmptyStateTitle = styled.h3`
  font-size: 1.25rem;
  font-weight: 600;
  color: #1f2937;
  margin-bottom: 0.5rem;
`;

const EmptyStateText = styled.p`
  font-size: 0.875rem;
  margin-bottom: 1.5rem;
`;

const EventStats = styled.div`
  display: flex;
  gap: 1rem;
  font-size: 0.875rem;
`;

const StatItem = styled.span<{ $muted?: boolean }>`
  color: ${props => props.$muted ? '#9ca3af' : '#1f2937'};
  font-weight: 600;
`;

// Component
export default function EventsTab({ saving, onSaveStatusChange }: EventsTabProps): React.JSX.Element {
  const [activeTab, setActiveTab] = useState<'events' | 'categories'>('events');
  const [events, setEvents] = useState<Event[]>([]);
  const [categories, setCategories] = useState<EventCategory[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [showCategoryModal, setShowCategoryModal] = useState(false);
  const [editingEvent, setEditingEvent] = useState<Event | null>(null);
  const [editingCategory, setEditingCategory] = useState<EventCategory | null>(null);
  const [formData, setFormData] = useState<Partial<Event>>({
    title: '',
    description: '',
    date: '',
    time: '',
    location: '',
    category: '',
    speaker: '',
    image_url: '',
    rsvp_enabled: false,
    rsvp_limit: 0,
    is_active: true,
  });

  // Load events and categories on mount
  useEffect(() => {
    loadEvents();
    loadCategories();
  }, []);

  // Load categories from Firestore
  const loadCategories = async () => {
    try {
      const categoriesRef = doc(db, 'eventCategories', 'default');
      const categoriesDoc = await getDoc(categoriesRef);
      
      if (categoriesDoc.exists()) {
        const data = categoriesDoc.data() as EventCategoriesConfig;
        const activeCategories = data.categories
          .filter(cat => cat.is_active)
          .sort((a, b) => a.order - b.order);
        setCategories(activeCategories);
        console.log('Categories loaded:', activeCategories.length);
      } else {
        // Create default categories if they don't exist
        await createDefaultCategories();
      }
    } catch (error) {
      console.error('Error loading categories:', error);
      setCategories(getDefaultCategories());
    }
  };

  const createDefaultCategories = async () => {
    const defaultCategories = getDefaultCategories();
    try {
      await setDoc(doc(db, 'eventCategories', 'default'), {
        categories: defaultCategories,
        updated_at: new Date().toISOString()
      });
      setCategories(defaultCategories);
      console.log('✅ Default categories created');
    } catch (error) {
      console.error('❌ Error creating default categories:', error);
    }
  };

  const getDefaultCategories = (): EventCategory[] => [
    { id: "lecture", label: "Lectures", color_bg: "#dbeafe", color_text: "#1e40af", order: 1, is_active: true },
    { id: "class", label: "Class", color_bg: "#fef3c7", color_text: "#92400e", order: 2, is_active: true },
    { id: "youth", label: "Youth", color_bg: "#fce7f3", color_text: "#9f1239", order: 3, is_active: true },
    { id: "women", label: "Women", color_bg: "#f3e8ff", color_text: "#6b21a8", order: 4, is_active: true },
    { id: "education", label: "Education", color_bg: "#dcfce7", color_text: "#15803d", order: 5, is_active: true },
    { id: "charity", label: "Charity", color_bg: "#fff7ed", color_text: "#c2410c", order: 6, is_active: true },
  ];

  const getCategoryColors = (categoryId: string) => {
    const category = categories.find(cat => cat.id === categoryId);
    if (category) {
      return { bg: category.color_bg, text: category.color_text };
    }
    return { bg: '#e5e7eb', text: '#374151' };
  };

  const getCategoryLabel = (categoryId: string): string => {
    const category = categories.find(cat => cat.id === categoryId);
    return category?.label || categoryId;
  };

  // Load events from Firebase
  const loadEvents = async () => {
    try {
      setLoading(true);
      const eventsRef = collection(db, 'events');
      const q = query(eventsRef, orderBy('date', 'desc'));
      const querySnapshot = await getDocs(q);
      
      const loadedEvents: Event[] = [];
      querySnapshot.forEach((doc) => {
        loadedEvents.push({ id: doc.id, ...doc.data() } as Event);
      });
      
      setEvents(loadedEvents);
      console.log('Events loaded:', loadedEvents.length);
    } catch (error) {
      console.error('Error loading events:', error);
      onSaveStatusChange(false);
    } finally {
      setLoading(false);
    }
  };

  // Event CRUD operations
  const openModal = (event?: Event) => {
    if (event) {
      setEditingEvent(event);
      setFormData(event);
    } else {
      setEditingEvent(null);
      setFormData({
        title: '',
        description: '',
        date: '',
        time: '',
        location: '',
        category: categories[0]?.id || '',
        speaker: '',
        image_url: '',
        rsvp_enabled: false,
        rsvp_limit: 0,
        rsvp_count: 0,
        is_active: true,
      });
    }
    setShowModal(true);
  };

  const closeModal = () => {
    setShowModal(false);
    setEditingEvent(null);
  };

  const handleInputChange = (field: keyof Event, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleSaveEvent = async () => {
    try {
      if (!formData.title || !formData.date || !formData.time) {
        alert('Please fill in required fields: Title, Date, and Time');
        return;
      }

      const timestamp = new Date().toISOString();

      if (editingEvent) {
        // Update existing event
        const eventRef = doc(db, 'events', editingEvent.id);
        await updateDoc(eventRef, {
          ...formData,
          updated_at: timestamp,
        });
        console.log('Event updated:', editingEvent.id);
      } else {
        // Create new event
        await addDoc(collection(db, 'events'), {
          ...formData,
          rsvp_count: 0,
          created_at: timestamp,
          updated_at: timestamp,
        });
        console.log('New event created');
      }

      onSaveStatusChange(true);
      closeModal();
      loadEvents();
    } catch (error) {
      console.error('Error saving event:', error);
      onSaveStatusChange(false);
    }
  };

  const handleDeleteEvent = async (eventId: string) => {
    if (!window.confirm('Are you sure you want to delete this event?')) {
      return;
    }

    try {
      await deleteDoc(doc(db, 'events', eventId));
      console.log('Event deleted:', eventId);
      onSaveStatusChange(true);
      loadEvents();
    } catch (error) {
      console.error('Error deleting event:', error);
      onSaveStatusChange(false);
    }
  };

  // Category CRUD operations
  const openCategoryModal = (category?: EventCategory) => {
    if (category) {
      setEditingCategory({ ...category });
    } else {
      setEditingCategory({
        id: `cat_${Date.now()}`,
        label: '',
        color_bg: '#e5e7eb',
        color_text: '#374151',
        order: categories.length + 1,
        is_active: true
      });
    }
    setShowCategoryModal(true);
  };

  const closeCategoryModal = () => {
    setShowCategoryModal(false);
    setEditingCategory(null);
  };

  const saveCategoryChanges = async (updatedCategory: EventCategory) => {
    try {
      const categoriesRef = doc(db, 'eventCategories', 'default');
      const categoriesDoc = await getDoc(categoriesRef);
      
      let updatedCategories: EventCategory[];
      
      if (categoriesDoc.exists()) {
        const data = categoriesDoc.data() as EventCategoriesConfig;
        const existing = data.categories.find(c => c.id === updatedCategory.id);
        
        if (existing) {
          // Update existing
          updatedCategories = data.categories.map(c => 
            c.id === updatedCategory.id ? updatedCategory : c
          );
        } else {
          // Add new
          updatedCategories = [...data.categories, updatedCategory];
        }
      } else {
        updatedCategories = [updatedCategory];
      }
      
      await setDoc(categoriesRef, {
        categories: updatedCategories,
        updated_at: new Date().toISOString()
      });
      
      console.log('✅ Category saved');
      onSaveStatusChange(true);
      closeCategoryModal();
      loadCategories();
    } catch (error) {
      console.error('❌ Error saving category:', error);
      onSaveStatusChange(false);
    }
  };

  const deleteCategory = async (categoryId: string) => {
    const eventsWithCategory = events.filter(e => e.category === categoryId);
    
    if (eventsWithCategory.length > 0) {
      const confirmed = window.confirm(
        `${eventsWithCategory.length} event(s) use this category. ` +
        `They will keep the category ID, but it won't appear in the dropdown. Continue?`
      );
      if (!confirmed) return;
    }
    
    try {
      const categoriesRef = doc(db, 'eventCategories', 'default');
      const categoriesDoc = await getDoc(categoriesRef);
      
      if (categoriesDoc.exists()) {
        const data = categoriesDoc.data() as EventCategoriesConfig;
        const updatedCategories = data.categories.filter(c => c.id !== categoryId);
        
        await setDoc(categoriesRef, {
          categories: updatedCategories,
          updated_at: new Date().toISOString()
        });
        
        console.log('✅ Category deleted');
        onSaveStatusChange(true);
        loadCategories();
      }
    } catch (error) {
      console.error('❌ Error deleting category:', error);
      onSaveStatusChange(false);
    }
  };

  const moveCategoryUp = async (categoryId: string) => {
    const index = categories.findIndex(c => c.id === categoryId);
    if (index <= 0) return;
    
    const reordered = [...categories];
    [reordered[index], reordered[index - 1]] = [reordered[index - 1], reordered[index]];
    reordered.forEach((cat, i) => cat.order = i + 1);
    
    await saveAllCategories(reordered);
  };

  const moveCategoryDown = async (categoryId: string) => {
    const index = categories.findIndex(c => c.id === categoryId);
    if (index >= categories.length - 1) return;
    
    const reordered = [...categories];
    [reordered[index], reordered[index + 1]] = [reordered[index + 1], reordered[index]];
    reordered.forEach((cat, i) => cat.order = i + 1);
    
    await saveAllCategories(reordered);
  };

  const saveAllCategories = async (updatedCategories: EventCategory[]) => {
    try {
      await setDoc(doc(db, 'eventCategories', 'default'), {
        categories: updatedCategories,
        updated_at: new Date().toISOString()
      });
      setCategories(updatedCategories);
      onSaveStatusChange(true);
    } catch (error) {
      console.error('Error saving categories:', error);
      onSaveStatusChange(false);
    }
  };

  const formatDate = (dateString: string): string => {
    try {
      const date = new Date(dateString);
      return date.toLocaleDateString('en-US', { 
        weekday: 'short',
        month: 'short', 
        day: 'numeric',
        year: 'numeric'
      });
    } catch {
      return dateString;
    }
  };

  // Calculate event statistics
  const upcomingCount = events.filter(e => !isPastEvent(e.date)).length;
  const pastCount = events.filter(e => isPastEvent(e.date)).length;

  return (
    <Card>
      {/* Tab Navigation */}
      <TabContainer>
        <Tab 
          $active={activeTab === 'events'}
          onClick={() => setActiveTab('events')}
        >
          <Calendar size={20} />
          Events
        </Tab>
        <Tab 
          $active={activeTab === 'categories'}
          onClick={() => setActiveTab('categories')}
        >
          <Tag size={20} />
          Categories
        </Tab>
      </TabContainer>

      {/* Events Tab */}
      {activeTab === 'events' && (
        <>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
            <CardTitle style={{ marginBottom: 0 }}>Events Management</CardTitle>
            {events.length > 0 && (
              <EventStats>
                <StatItem>{upcomingCount} upcoming</StatItem>
                <StatItem $muted>{pastCount} past</StatItem>
              </EventStats>
            )}
          </div>

          <ButtonGroup>
            <Button onClick={() => openModal()}>
              <Plus size={20} />
              Add New Event
            </Button>
          </ButtonGroup>

          {loading ? (
            <EmptyState>
              <EmptyStateText>Loading events...</EmptyStateText>
            </EmptyState>
          ) : events.length === 0 ? (
            <EmptyState>
              <EmptyStateTitle>No events yet</EmptyStateTitle>
              <EmptyStateText>
                Create your first event to start engaging with your community
              </EmptyStateText>
              <Button onClick={() => openModal()}>
                <Plus size={20} />
                Add First Event
              </Button>
            </EmptyState>
          ) : (
            <EventsGrid>
              {events.map(event => {
                const pastEvent = isPastEvent(event.date);
                const categoryColors = getCategoryColors(event.category);
                
                return (
                  <EventCard key={event.id} $active={event.is_active} $isPast={pastEvent}>
                    <EventCategoryBadge 
                      style={{ 
                        background: categoryColors.bg, 
                        color: categoryColors.text 
                      }}
                    >
                      {getCategoryLabel(event.category).toUpperCase()}
                    </EventCategoryBadge>
                    
                    <EventTitle>
                      {event.title}
                      {pastEvent && <PastEventBadge>PAST EVENT</PastEventBadge>}
                    </EventTitle>
                    
                    <EventDetail>
                      <Calendar size={16} />
                      {formatDate(event.date)} at {event.time}
                    </EventDetail>
                    
                    {event.location && (
                      <EventDetail>
                        <MapPin size={16} />
                        {event.location}
                      </EventDetail>
                    )}
                    
                    {event.speaker && (
                      <EventDetail>
                        👤 Speaker: {event.speaker}
                      </EventDetail>
                    )}

                    {event.rsvp_enabled && (
                      <EventDetail>
                        <Users size={16} />
                        {event.rsvp_count || 0} / {event.rsvp_limit || 'Unlimited'} RSVPs
                      </EventDetail>
                    )}
                    
                    <EventDescription>
                      {event.description.length > 120 
                        ? event.description.substring(0, 120) + '...' 
                        : event.description}
                    </EventDescription>
                    
                    <EventActions>
                      <SmallButton onClick={() => openModal(event)}>
                        <Edit2 size={16} />
                        Edit
                      </SmallButton>
                      <SmallButton 
                        variant="danger"
                        onClick={() => handleDeleteEvent(event.id)}
                      >
                        <Trash2 size={16} />
                        {pastEvent ? 'Delete Past Event' : 'Delete'}
                      </SmallButton>
                    </EventActions>
                  </EventCard>
                );
              })}
            </EventsGrid>
          )}
        </>
      )}

      {/* Categories Tab */}
      {activeTab === 'categories' && (
        <>
          <CardTitle>Manage Event Categories</CardTitle>
          
          <ButtonGroup>
            <Button onClick={() => openCategoryModal()}>
              <Plus size={20} />
              Add Category
            </Button>
          </ButtonGroup>

          {categories.length === 0 ? (
            <EmptyState>
              <EmptyStateTitle>No categories</EmptyStateTitle>
              <EmptyStateText>Add your first category to organize events</EmptyStateText>
            </EmptyState>
          ) : (
            <CategoriesGrid>
              {categories.map((category, index) => (
                <CategoryCard key={category.id}>
                  <CategoryPreview 
                    style={{ 
                      background: category.color_bg, 
                      color: category.color_text 
                    }}
                  >
                    {category.label.toUpperCase()}
                  </CategoryPreview>
                  
                  <CategoryLabel>{category.label}</CategoryLabel>
                  
                  <CategoryColors>
                    <ColorSwatch style={{ background: category.color_bg }}>
                      <span>BG</span>
                    </ColorSwatch>
                    <ColorSwatch style={{ background: category.color_text }}>
                      <span>Text</span>
                    </ColorSwatch>
                  </CategoryColors>
                  
                  <CategoryActions>
                    <SmallButton onClick={() => openCategoryModal(category)}>
                      <Edit2 size={14} />
                      Edit
                    </SmallButton>
                    
                    <SmallButton 
                      onClick={() => moveCategoryUp(category.id)}
                      disabled={index === 0}
                    >
                      ↑
                    </SmallButton>
                    
                    <SmallButton 
                      onClick={() => moveCategoryDown(category.id)}
                      disabled={index === categories.length - 1}
                    >
                      ↓
                    </SmallButton>
                    
                    <SmallButton 
                      variant="danger"
                      onClick={() => deleteCategory(category.id)}
                    >
                      <Trash2 size={14} />
                    </SmallButton>
                  </CategoryActions>
                </CategoryCard>
              ))}
            </CategoriesGrid>
          )}
        </>
      )}

      {/* Event Modal */}
      <Modal $show={showModal} onClick={closeModal}>
        <ModalContent onClick={(e) => e.stopPropagation()}>
          <ModalHeader>
            <ModalTitle>
              {editingEvent ? 'Edit Event' : 'Add New Event'}
            </ModalTitle>
            <CloseButton onClick={closeModal}>
              <X size={24} />
            </CloseButton>
          </ModalHeader>

          <Form>
            <FormGroup>
              <Label>Title *</Label>
              <Input
                type="text"
                value={formData.title || ''}
                onChange={(e) => handleInputChange('title', e.target.value)}
                placeholder="e.g., Islamic Finance Workshop"
              />
            </FormGroup>

            <FormGroup>
              <Label>Description *</Label>
              <TextArea
                value={formData.description || ''}
                onChange={(e) => handleInputChange('description', e.target.value)}
                placeholder="Describe the event..."
              />
            </FormGroup>

            <TwoColumnGrid>
              <FormGroup>
                <Label>Date *</Label>
                <Input
                  type="date"
                  value={formData.date || ''}
                  onChange={(e) => handleInputChange('date', e.target.value)}
                />
              </FormGroup>

              <FormGroup>
                <Label>Time *</Label>
                <Input
                  type="text"
                  value={formData.time || ''}
                  onChange={(e) => handleInputChange('time', e.target.value)}
                  placeholder="e.g., 7:00 PM"
                />
              </FormGroup>
            </TwoColumnGrid>

            <FormGroup>
              <Label>Category</Label>
              <Select
                value={formData.category || categories[0]?.id}
                onChange={(e) => handleInputChange('category', e.target.value)}
              >
                {categories.map(cat => (
                  <option key={cat.id} value={cat.id}>
                    {cat.label}
                  </option>
                ))}
              </Select>
            </FormGroup>

            <FormGroup>
              <Label>Location</Label>
              <Input
                type="text"
                value={formData.location || ''}
                onChange={(e) => handleInputChange('location', e.target.value)}
                placeholder="e.g., Main Prayer Hall"
              />
            </FormGroup>

            <FormGroup>
              <Label>Speaker (Optional)</Label>
              <Input
                type="text"
                value={formData.speaker || ''}
                onChange={(e) => handleInputChange('speaker', e.target.value)}
                placeholder="e.g., Sheikh Ahmad"
              />
            </FormGroup>

            <FormGroup>
              <Label>Image URL (Optional)</Label>
              <Input
                type="text"
                value={formData.image_url || ''}
                onChange={(e) => handleInputChange('image_url', e.target.value)}
                placeholder="https://example.com/image.jpg"
              />
            </FormGroup>

            <FormGroup>
              <CheckboxLabel>
                <Checkbox
                  type="checkbox"
                  checked={formData.rsvp_enabled || false}
                  onChange={(e) => handleInputChange('rsvp_enabled', e.target.checked)}
                />
                Enable RSVP
              </CheckboxLabel>
            </FormGroup>

            {formData.rsvp_enabled && (
              <FormGroup>
                <Label>RSVP Limit (0 = Unlimited)</Label>
                <Input
                  type="number"
                  min="0"
                  value={formData.rsvp_limit || 0}
                  onChange={(e) => handleInputChange('rsvp_limit', parseInt(e.target.value) || 0)}
                />
              </FormGroup>
            )}

            <FormGroup>
              <CheckboxLabel>
                <Checkbox
                  type="checkbox"
                  checked={formData.is_active ?? true}
                  onChange={(e) => handleInputChange('is_active', e.target.checked)}
                />
                Event is Active (visible to users)
              </CheckboxLabel>
            </FormGroup>

            <ButtonGroup>
              <Button onClick={handleSaveEvent} disabled={saving}>
                <Save size={20} />
                {saving ? 'Saving...' : (editingEvent ? 'Update Event' : 'Create Event')}
              </Button>
              <Button 
                onClick={closeModal}
                style={{ background: '#6b7280' }}
              >
                Cancel
              </Button>
            </ButtonGroup>
          </Form>
        </ModalContent>
      </Modal>

      {/* Category Edit Modal */}
      <Modal $show={showCategoryModal} onClick={closeCategoryModal}>
        <ModalContent onClick={(e) => e.stopPropagation()}>
          <ModalHeader>
            <ModalTitle>
              {editingCategory?.label ? 'Edit Category' : 'Add New Category'}
            </ModalTitle>
            <CloseButton onClick={closeCategoryModal}>
              <X size={24} />
            </CloseButton>
          </ModalHeader>

          {editingCategory && (
            <Form>
              <FormGroup>
                <Label>Category Name *</Label>
                <Input
                  type="text"
                  value={editingCategory.label}
                  onChange={(e) => setEditingCategory({
                    ...editingCategory,
                    label: e.target.value
                  })}
                  placeholder="e.g., Ramadan Special"
                />
              </FormGroup>

              <TwoColumnGrid>
                <FormGroup>
                  <Label>Background Color</Label>
                  <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
                    <Input
                      type="color"
                      value={editingCategory.color_bg}
                      onChange={(e) => setEditingCategory({
                        ...editingCategory,
                        color_bg: e.target.value
                      })}
                      style={{ width: '80px', padding: '0.5rem' }}
                    />
                    <Input
                      type="text"
                      value={editingCategory.color_bg}
                      onChange={(e) => setEditingCategory({
                        ...editingCategory,
                        color_bg: e.target.value
                      })}
                      placeholder="#dbeafe"
                    />
                  </div>
                </FormGroup>

                <FormGroup>
                  <Label>Text Color</Label>
                  <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
                    <Input
                      type="color"
                      value={editingCategory.color_text}
                      onChange={(e) => setEditingCategory({
                        ...editingCategory,
                        color_text: e.target.value
                      })}
                      style={{ width: '80px', padding: '0.5rem' }}
                    />
                    <Input
                      type="text"
                      value={editingCategory.color_text}
                      onChange={(e) => setEditingCategory({
                        ...editingCategory,
                        color_text: e.target.value
                      })}
                      placeholder="#1e40af"
                    />
                  </div>
                </FormGroup>
              </TwoColumnGrid>

              <FormGroup>
                <Label>Preview</Label>
                <div 
                  style={{ 
                    background: editingCategory.color_bg, 
                    color: editingCategory.color_text,
                    padding: '0.75rem 1.5rem',
                    borderRadius: '0.5rem',
                    textAlign: 'center',
                    fontWeight: 'bold',
                    fontSize: '0.875rem'
                  }}
                >
                  {editingCategory.label.toUpperCase() || 'CATEGORY NAME'}
                </div>
              </FormGroup>

              <FormGroup>
                <CheckboxLabel>
                  <Checkbox
                    type="checkbox"
                    checked={editingCategory.is_active}
                    onChange={(e) => setEditingCategory({
                      ...editingCategory,
                      is_active: e.target.checked
                    })}
                  />
                  Active (visible in event creation)
                </CheckboxLabel>
              </FormGroup>

              <ButtonGroup>
                <Button onClick={() => saveCategoryChanges(editingCategory)}>
                  <Save size={20} />
                  Save Category
                </Button>
                <Button 
                  onClick={closeCategoryModal}
                  style={{ background: '#6b7280' }}
                >
                  Cancel
                </Button>
              </ButtonGroup>
            </Form>
          )}
        </ModalContent>
      </Modal>
    </Card>
  );
}
