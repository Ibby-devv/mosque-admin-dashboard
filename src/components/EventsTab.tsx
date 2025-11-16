import React, { useState, useEffect, useCallback } from 'react';
import styled from 'styled-components';
import { Theme, media } from '../constants/theme';
import Card from './ui/Card';
import { Save, Plus, Edit2, Trash2, Calendar, MapPin, Users, X, Tag, ArrowUp, ArrowDown, Check } from 'lucide-react';
import TimeInput from './TimeInput';
import ImageUpload from './ImageUpload';
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
  serverTimestamp,
  Timestamp
} from 'firebase/firestore';
import { db } from '../firebase';
import { Event, EventCategory, EventCategoriesConfig } from '../types';
import { usePermissions } from '../hooks/usePermissions';
import { Permission } from '../constants/roles';

interface EventsTabProps {
  saving: boolean;
  onSaveStatusChange: (success: boolean) => void;
}

// Helper function to check if event is in the past
const isPastEvent = (eventDate: Timestamp): boolean => {
  const today = new Date().toLocaleString('en-AU', {
    timeZone: 'Australia/Sydney',
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  });
  const [day, month, year] = today.split('/');
  const todayFormatted = `${year}-${month}-${day}`;
  
  // Convert Timestamp to date string
  const date = eventDate?.toDate ? eventDate.toDate() : new Date(eventDate);
  const eventDateStr = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;
  
  return eventDateStr < todayFormatted;
};

// Styled Components

const TabContainer = styled.div`
  display: flex;
  gap: ${Theme.spacing.sm};
  margin-bottom: ${Theme.spacing.xl};
  border-bottom: 2px solid ${Theme.colors.border.base};
`;

const Tab = styled.button<{ $active: boolean }>`
  display: flex;
  align-items: center;
  gap: ${Theme.spacing.sm};
  padding: ${Theme.spacing.md} ${Theme.spacing.xl};
  border: none;
  background: none;
  cursor: pointer;
  font-weight: 600;
  color: ${props => props.$active ? Theme.colors.brand.navy[700] : Theme.colors.text.muted};
  border-bottom: 3px solid ${props => props.$active ? Theme.colors.brand.navy[700] : 'transparent'};
  margin-bottom: -2px;
  transition: all 0.2s;

  &:hover { color: ${Theme.colors.brand.navy[700]}; }
`;

const CardTitle = styled.h2`
  font-size: ${Theme.typography.h2};
  font-weight: bold;
  color: ${Theme.colors.text.strong};
  margin-bottom: ${Theme.spacing.xl};

  ${media.sm} { font-size: ${Theme.typography.h1}; }
`;

const ButtonGroup = styled.div`
  display: flex;
  gap: ${Theme.spacing.md};
  margin-bottom: ${Theme.spacing.xl};
  flex-wrap: wrap;
`;

const Button = styled.button<{ variant?: 'primary' | 'danger' | 'success' }>`
  display: flex;
  align-items: center;
  justify-content: center;
  gap: ${Theme.spacing.sm};
  padding: ${Theme.spacing.md} ${Theme.spacing.xl};
  min-height: 48px;
  border-radius: ${Theme.radius.md};
  font-weight: 600;
  font-size: ${Theme.typography.body};
  border: none;
  cursor: pointer;
  transition: all 0.2s;
  background: ${props => 
    props.variant === 'danger' ? Theme.colors.status.error :
    props.variant === 'success' ? Theme.colors.status.success :
    Theme.colors.brand.navy[700]
  };
  color: white;

  &:hover {
    background: ${props => 
      props.variant === 'danger' ? Theme.colors.status.errorDark :
      props.variant === 'success' ? Theme.colors.status.success :
      Theme.colors.brand.navy[600]
    };
    transform: translateY(-1px);
    box-shadow: ${Theme.shadow.soft};
  }

  &:disabled {
    background: ${Theme.colors.border.medium};
    cursor: not-allowed;
    transform: none;
  }
`;

const SmallButton = styled.button<{ variant?: 'primary' | 'danger' | 'success' }>`
  display: flex;
  align-items: center;
  gap: ${Theme.spacing.xs};
  padding: ${Theme.spacing.sm} ${Theme.spacing.md};
  min-height: 36px;
  border-radius: ${Theme.radius.sm};
  font-weight: 500;
  font-size: ${Theme.typography.small};
  border: none;
  cursor: pointer;
  transition: all 0.2s;
  background: ${props => 
    props.variant === 'danger' ? Theme.colors.status.error : 
    props.variant === 'success' ? Theme.colors.status.success :
    Theme.colors.brand.navy[700]
  };
  color: white;

  &:hover {
    background: ${props => 
      props.variant === 'danger' ? Theme.colors.status.errorDark : 
      props.variant === 'success' ? Theme.colors.status.success :
      Theme.colors.brand.navy[600]
    };
    transform: translateY(-1px);
  }

  &:disabled {
    background: ${Theme.colors.border.medium};
    cursor: not-allowed;
    transform: none;
  }
`;

const EventsGrid = styled.div`
  display: grid;
  grid-template-columns: 1fr;
  gap: ${Theme.spacing.lg};
  margin-top: ${Theme.spacing.lg};

  ${media.sm} {
    grid-template-columns: repeat(auto-fill, minmax(320px, 1fr));
  }
`;

const EventCard = styled.div<{ $active: boolean; $isPast: boolean }>`
  border: 1px solid ${Theme.colors.border.base};
  background: ${Theme.colors.surface.card};
  border-left: 4px solid ${props => props.$isPast ? Theme.colors.border.soft : Theme.colors.brand.navy[700]};
  border-radius: ${Theme.radius.md};
  padding: ${Theme.spacing.lg};
  position: relative;
  opacity: ${props => props.$isPast ? 0.6 : 1};
  transition: all 0.2s;
  box-shadow: ${Theme.shadow.soft};

  &:hover {
    opacity: 1;
    box-shadow: ${Theme.shadow.card};
    border-color: ${Theme.colors.brand.navy[700]};
  }
`;

const EventCategoryBadge = styled.span`
  display: inline-block;
  padding: ${Theme.spacing.xs} ${Theme.spacing.lg};
  border-radius: ${Theme.radius.pill};
  font-size: ${Theme.typography.small};
  font-weight: 600;
  margin-bottom: ${Theme.spacing.md};
`;

const PastEventBadge = styled.span`
  display: inline-block;
  background: ${Theme.colors.status.errorLight};
  color: ${Theme.colors.status.errorDark};
  font-size: ${Theme.typography.small};
  font-weight: 600;
  padding: ${Theme.spacing.xs} ${Theme.spacing.sm};
  border-radius: ${Theme.radius.sm};
  margin-left: ${Theme.spacing.sm};
`;

const CancelledBadge = styled.span`
  display: inline-block;
  background: ${Theme.colors.status.errorLight};
  color: ${Theme.colors.status.errorDark};
  font-size: ${Theme.typography.small};
  font-weight: 600;
  padding: ${Theme.spacing.xs} ${Theme.spacing.sm};
  border-radius: ${Theme.radius.sm};
  margin-left: ${Theme.spacing.sm};
`;

const EventTitle = styled.h3`
  font-size: ${Theme.typography.h3};
  font-weight: bold;
  color: ${Theme.colors.text.strong};
  margin-bottom: ${Theme.spacing.sm};
  display: flex;
  align-items: center;
`;

const EventDetail = styled.div`
  display: flex;
  align-items: center;
  gap: ${Theme.spacing.sm};
  font-size: ${Theme.typography.body};
  color: ${Theme.colors.text.muted};
  margin-bottom: ${Theme.spacing.sm};
`;

const EventDescription = styled.p`
  font-size: ${Theme.typography.body};
  color: ${Theme.colors.text.muted};
  margin: ${Theme.spacing.md} 0;
  line-height: 1.5;
`;

const EventActions = styled.div`
  display: flex;
  gap: ${Theme.spacing.sm};
  margin-top: ${Theme.spacing.lg};
`;

const CategoriesGrid = styled.div`
  display: grid;
  grid-template-columns: 1fr;
  gap: ${Theme.spacing.lg};
  margin-top: ${Theme.spacing.xl};

  ${media.sm} {
    grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
  }
`;

const CategoryCard = styled.div`
  border: 1px solid ${Theme.colors.border.base};
  border-radius: ${Theme.radius.md};
  padding: ${Theme.spacing.lg};
  background: ${Theme.colors.surface.card};
  transition: all 0.2s;
  box-shadow: ${Theme.shadow.soft};

  &:hover {
    box-shadow: ${Theme.shadow.card};
  }
`;

const CategoryPreview = styled.div`
  padding: ${Theme.spacing.md} ${Theme.spacing.lg};
  border-radius: ${Theme.radius.md};
  text-align: center;
  font-weight: bold;
  font-size: ${Theme.typography.small};
  margin-bottom: ${Theme.spacing.lg};
`;

const CategoryLabel = styled.h4`
  font-size: ${Theme.typography.h3};
  font-weight: 600;
  color: ${Theme.colors.text.strong};
  margin-bottom: ${Theme.spacing.md};
`;

const CategoryColors = styled.div`
  display: flex;
  gap: ${Theme.spacing.sm};
  margin-bottom: ${Theme.spacing.lg};
`;

const ColorSwatch = styled.div`
  flex: 1;
  height: 40px;
  border-radius: ${Theme.radius.sm};
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: ${Theme.typography.small};
  font-weight: 600;
  border: 1px solid ${Theme.colors.border.base};
  
  span {
    color: #fff;
    text-shadow: 0 0 2px rgba(0,0,0,0.5);
  }
`;

const CategoryActions = styled.div`
  display: flex;
  gap: ${Theme.spacing.sm};
  flex-wrap: wrap;
`;

const Modal = styled.div<{ $show: boolean }>`
  display: ${props => props.$show ? 'block' : 'none'};
  position: fixed;
  top: 0; left: 0; right: 0; bottom: 0;
  background: rgba(0, 0, 0, 0.5);
  z-index: 1000;
  overflow-y: auto;
  padding: ${Theme.spacing.lg};
`;

const ModalContent = styled.div`
  background: ${Theme.colors.surface.card};
  max-width: 42rem;
  margin: 2rem auto;
  border-radius: ${Theme.radius.lg};
  padding: ${Theme.spacing.xl};
  position: relative;
  box-shadow: ${Theme.shadow.card};

  ${media.sm} { padding: ${Theme.spacing.xxl}; }
`;

const ModalHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: ${Theme.spacing.xl};
`;

const ModalTitle = styled.h3`
  font-size: ${Theme.typography.h2};
  font-weight: bold;
  color: ${Theme.colors.text.strong};

  ${media.sm} { font-size: ${Theme.typography.h1}; }
`;

const CloseButton = styled.button`
  background: none;
  border: none;
  cursor: pointer;
  padding: ${Theme.spacing.sm};
  color: ${Theme.colors.text.muted};
  min-height: 44px; min-width: 44px;
  display: flex; align-items: center; justify-content: center;
  border-radius: ${Theme.radius.sm};
  transition: all 0.2s;

  &:hover {
    color: ${Theme.colors.text.strong};
    background: ${Theme.colors.surface.muted};
  }
`;

const Form = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${Theme.spacing.lg};
`;

const FormGroup = styled.div``;

const Label = styled.label`
  display: block;
  font-size: ${Theme.typography.body};
  font-weight: 600;
  color: ${Theme.colors.text.strong};
  margin-bottom: ${Theme.spacing.sm};
`;

const Input = styled.input`
  width: 100%;
  padding: ${Theme.spacing.md} ${Theme.spacing.lg};
  min-height: 44px;
  border: 1px solid ${Theme.colors.border.base};
  border-radius: ${Theme.radius.md};
  font-size: ${Theme.typography.body};
  outline: none;
  transition: all 0.2s;
  box-sizing: border-box;

  &:focus {
    border-color: ${Theme.colors.brand.navy[700]};
    box-shadow: 0 0 0 3px ${Theme.colors.accent.blueSoft};
  }
`;

const TextArea = styled.textarea`
  width: 100%;
  padding: ${Theme.spacing.md} ${Theme.spacing.lg};
  border: 1px solid ${Theme.colors.border.base};
  border-radius: ${Theme.radius.md};
  font-size: ${Theme.typography.body};
  outline: none;
  transition: all 0.2s;
  box-sizing: border-box;
  min-height: 100px;
  resize: vertical;
  font-family: inherit;

  &:focus {
    border-color: ${Theme.colors.brand.navy[700]};
    box-shadow: 0 0 0 3px ${Theme.colors.accent.blueSoft};
  }
`;

const Select = styled.select`
  width: 100%;
  padding: ${Theme.spacing.md} ${Theme.spacing.lg};
  min-height: 44px;
  border: 1px solid ${Theme.colors.border.base};
  border-radius: ${Theme.radius.md};
  font-size: ${Theme.typography.body};
  outline: none;
  transition: all 0.2s;
  box-sizing: border-box;
  background: ${Theme.colors.surface.card};

  &:focus {
    border-color: ${Theme.colors.brand.navy[700]};
    box-shadow: 0 0 0 3px ${Theme.colors.accent.blueSoft};
  }
`;

const TwoColumnGrid = styled.div`
  display: grid;
  grid-template-columns: 1fr;
  gap: ${Theme.spacing.lg};

  ${media.sm} { grid-template-columns: repeat(2, 1fr); }
`;

const Checkbox = styled.input`
  width: 1.25rem;
  height: 1.25rem;
  cursor: pointer;
`;

const CheckboxLabel = styled.label`
  display: flex;
  align-items: center;
  gap: ${Theme.spacing.sm};
  font-size: ${Theme.typography.body};
  color: ${Theme.colors.text.strong};
  cursor: pointer;
`;

const EmptyState = styled.div`
  text-align: center;
  padding: 3rem 1rem;
  color: ${Theme.colors.text.muted};
`;

const EmptyStateTitle = styled.h3`
  font-size: ${Theme.typography.h2};
  font-weight: 600;
  color: ${Theme.colors.text.strong};
  margin-bottom: ${Theme.spacing.sm};
`;

const EmptyStateText = styled.p`
  font-size: ${Theme.typography.body};
  margin-bottom: ${Theme.spacing.xl};
`;

const EventStats = styled.div`
  display: flex;
  gap: ${Theme.spacing.lg};
  font-size: ${Theme.typography.body};
`;

const StatItem = styled.span<{ $muted?: boolean }>`
  color: ${props => props.$muted ? Theme.colors.text.subtle : Theme.colors.text.strong};
  font-weight: 600;
`;

// Component
export default function EventsTab({ saving, onSaveStatusChange }: EventsTabProps): React.JSX.Element {
  const { hasPermission } = usePermissions();
  const canEdit = hasPermission(Permission.EDIT_EVENTS);
  const canDelete = hasPermission(Permission.DELETE_EVENTS);
  
  // Date validation regex - HTML date input uses YYYY-MM-DD format
  const DATE_FORMAT_REGEX = /^\d{4}-\d{2}-\d{2}$/;
  
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

  

  const getDefaultCategories = useCallback((): EventCategory[] => [
    { id: "lecture", label: "Lectures", color_bg: "#dbeafe", color_text: "#1e40af", order: 1, is_active: true },
    { id: "class", label: "Class", color_bg: "#fef3c7", color_text: "#92400e", order: 2, is_active: true },
    { id: "youth", label: "Youth", color_bg: "#fce7f3", color_text: "#9f1239", order: 3, is_active: true },
    { id: "women", label: "Women", color_bg: "#f3e8ff", color_text: "#6b21a8", order: 4, is_active: true },
    { id: "education", label: "Education", color_bg: "#dcfce7", color_text: "#15803d", order: 5, is_active: true },
    { id: "charity", label: "Charity", color_bg: "#fff7ed", color_text: "#c2410c", order: 6, is_active: true },
  ], []);

  const createDefaultCategories = useCallback(async () => {
    const defaultCategories = getDefaultCategories();
    try {
      await setDoc(doc(db, 'eventCategories', 'default'), {
        categories: defaultCategories,
        updated_at: serverTimestamp()
      });
      setCategories(defaultCategories);
      console.log('✅ Default categories created');
    } catch (error) {
      console.error('❌ Error creating default categories:', error);
    }
  }, [getDefaultCategories]);

  // Load categories from Firestore
  const loadCategories = useCallback(async () => {
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
  }, [createDefaultCategories, getDefaultCategories]);



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
  const loadEvents = useCallback(async () => {
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
    } finally {
      setLoading(false);
    }
  }, []);

  // Load events and categories on mount
  useEffect(() => {
    loadEvents();
    loadCategories();
  }, [loadEvents, loadCategories]);

  // Event CRUD operations
  const openModal = (event?: Event) => {
    if (event) {
      setEditingEvent(event);
      // Convert Timestamp to string for date input
      // Use local date components to avoid timezone shifts
      let dateStr = '';
      if (event.date?.toDate) {
        const date = event.date.toDate();
        const year = date.getFullYear();
        const month = String(date.getMonth() + 1).padStart(2, '0');
        const day = String(date.getDate()).padStart(2, '0');
        dateStr = `${year}-${month}-${day}`;
      } else if (typeof event.date === 'string') {
        dateStr = event.date;
      }
      setFormData({ ...event, date: dateStr });
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
    // Keep date as string for the input field, will convert to Timestamp on save
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleSaveEvent = async () => {
    try {
      if (!formData.title || !formData.date || !formData.time) {
        alert('Please fill in required fields: Title, Date, and Time');
        return;
      }

      // Convert date to Timestamp for storage
      let dateToSave: Timestamp;
      if (typeof formData.date === 'string') {
        // HTML date input provides YYYY-MM-DD format
        // Validate the format before processing
        if (!DATE_FORMAT_REGEX.test(formData.date)) {
          alert('Invalid date format detected. Please select a date from the date picker.');
          return;
        }
        const dateObj = new Date(formData.date + 'T00:00:00');
        if (isNaN(dateObj.getTime())) {
          alert('The selected date is invalid. Please choose a different date.');
          return;
        }
        dateToSave = Timestamp.fromDate(dateObj);
      } else if (formData.date instanceof Timestamp) {
        // Already a Timestamp (from editing existing event)
        dateToSave = formData.date;
      } else if (formData.date && typeof formData.date === 'object' && 'toDate' in formData.date) {
        // Firebase Timestamp-like object
        dateToSave = formData.date as Timestamp;
      } else {
        // Unexpected type - try to handle gracefully
        console.error('Unexpected date type:', typeof formData.date, formData.date);
        alert('Unable to process the date. Please select a new date from the date picker.');
        return;
      }

      const eventData = {
        ...formData,
        date: dateToSave,
      };

      if (editingEvent) {
        // Update existing event
        const eventRef = doc(db, 'events', editingEvent.id);
        await updateDoc(eventRef, {
          ...eventData,
          updated_at: serverTimestamp(),
        });
        console.log('Event updated:', editingEvent.id);
      } else {
        // Create new event
        await addDoc(collection(db, 'events'), {
          ...eventData,
          rsvp_count: 0,
          created_at: serverTimestamp(),
          updated_at: serverTimestamp(),
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

  const handleCancelEvent = async (eventId: string, eventTitle: string) => {
    if (!window.confirm(`Cancel "${eventTitle}"? Users will be notified.`)) {
      return;
    }

    try {
      await updateDoc(doc(db, 'events', eventId), {
        is_active: false,
        updated_at: serverTimestamp(),
      });
      console.log('Event cancelled:', eventId);
      onSaveStatusChange(true);
      loadEvents();
    } catch (error) {
      console.error('Error cancelling event:', error);
      onSaveStatusChange(false);
    }
  };

  const handleReactivateEvent = async (eventId: string, eventTitle: string) => {
    if (!window.confirm(`Reactivate "${eventTitle}"? Users will be notified.`)) {
      return;
    }

    try {
      await updateDoc(doc(db, 'events', eventId), {
        is_active: true,
        updated_at: serverTimestamp(),
      });
      console.log('Event reactivated:', eventId);
      onSaveStatusChange(true);
      loadEvents();
    } catch (error) {
      console.error('Error reactivating event:', error);
      onSaveStatusChange(false);
    }
  };

  const handleDeleteEvent = async (eventId: string, eventTitle: string) => {
    if (!window.confirm(`Permanently delete "${eventTitle}"? This cannot be undone.`)) {
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
        updated_at: serverTimestamp()
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
          updated_at: serverTimestamp()
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
        updated_at: serverTimestamp()
      });
      setCategories(updatedCategories);
      onSaveStatusChange(true);
    } catch (error) {
      console.error('Error saving categories:', error);
      onSaveStatusChange(false);
    }
  };

  const formatDate = (timestamp: Timestamp): string => {
    try {
      // Handle both Timestamp objects and fallback dates
      let date: Date;
      if (timestamp?.toDate) {
        date = timestamp.toDate();
      } else if (timestamp instanceof Date) {
        date = timestamp;
      } else if (typeof timestamp === 'string' || typeof timestamp === 'number') {
        date = new Date(timestamp);
      } else {
        return String(timestamp || '');
      }
      
      // Validate the date is valid
      if (isNaN(date.getTime())) {
        return String(timestamp || '');
      }
      
      // Format as DD-MM-YYYY for Australian format
      const day = String(date.getDate()).padStart(2, '0');
      const month = String(date.getMonth() + 1).padStart(2, '0');
      const year = date.getFullYear();
      
      // Get day of week for better readability
      const dayName = date.toLocaleDateString('en-AU', { weekday: 'short' });
      
      return `${dayName}, ${day}-${month}-${year}`;
    } catch {
      return String(timestamp || '');
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
            <Button onClick={() => openModal()} disabled={!canEdit}>
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
              <Button onClick={() => openModal()} disabled={!canEdit}>
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
                      {!event.is_active && !pastEvent && <CancelledBadge>CANCELLED</CancelledBadge>}
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
                      
                      {/* Show Cancel button for upcoming active events */}
                      {!pastEvent && event.is_active && (
                        <SmallButton 
                          variant="danger"
                          onClick={() => handleCancelEvent(event.id, event.title)}
                        >
                          <X size={16} />
                          Cancel Event
                        </SmallButton>
                      )}
                      
                      {/* Show Reactivate button for cancelled upcoming events */}
                      {!pastEvent && !event.is_active && (
                        <SmallButton 
                          variant="success"
                          onClick={() => handleReactivateEvent(event.id, event.title)}
                        >
                          <Check size={16} />
                          Reactivate
                        </SmallButton>
                      )}
                      
                      {/* Show Delete button for past events or cancelled events */}
                      {(pastEvent || !event.is_active) && (
                        <SmallButton 
                          variant="danger"
                          onClick={() => handleDeleteEvent(event.id, event.title)}
                          disabled={!canDelete}
                        >
                          <Trash2 size={16} />
                          Delete
                        </SmallButton>
                      )}
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
                      <ArrowUp size={14} />
                    </SmallButton>
                    
                    <SmallButton 
                      onClick={() => moveCategoryDown(category.id)}
                      disabled={index === categories.length - 1}
                    >
                      <ArrowDown size={14} />
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
                <TimeInput
                  value={formData.time || ''}
                  onChange={(value) => handleInputChange('time', value)}
                  placeholder="Select time"
                  required
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
              <Label>Event Image (Optional)</Label>
              <ImageUpload
                currentImageUrl={formData.image_url}
                onImageUpload={(result) => handleInputChange('image_url', result.url)}
                onImageDelete={() => handleInputChange('image_url', '')}
                storageRoot="events/tmp"
                disabled={saving}
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
              <Button onClick={handleSaveEvent} disabled={saving || !canEdit}>
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
