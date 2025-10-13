import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import { Save, Plus, Edit2, Trash2, Calendar, MapPin, Users, X } from 'lucide-react';
import { 
  collection, 
  addDoc, 
  updateDoc, 
  deleteDoc, 
  doc, 
  getDocs,
  query,
  orderBy,
  Timestamp 
} from 'firebase/firestore';
import { db } from '../firebase';

// Types
interface Event {
  id: string;
  title: string;
  description: string;
  date: string; // ISO date string
  time: string; // e.g., "7:00 PM"
  location?: string;
  category: 'lecture' | 'community' | 'youth' | 'women' | 'education' | 'charity' | 'other';
  speaker?: string;
  image_url?: string;
  rsvp_enabled?: boolean;
  rsvp_limit?: number;
  rsvp_count?: number;
  is_active: boolean;
  created_at?: string;
  updated_at?: string;
}

interface EventsTabProps {
  saving: boolean;
  onSaveStatusChange: (success: boolean) => void;
}

// Styled Components
const Card = styled.div`
  background: white;
  border-radius: 0.75rem;
  box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.1);
  padding: 1.5rem;
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
`;

const EventsGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(350px, 1fr));
  gap: 1.5rem;
  margin-top: 1.5rem;
`;

const EventCard = styled.div<{ $active: boolean }>`
  border: 1px solid ${props => props.$active ? '#10b981' : '#e5e7eb'};
  background: ${props => props.$active ? '#f0fdf4' : '#f9fafb'};
  border-radius: 0.75rem;
  padding: 1.25rem;
  position: relative;
  opacity: ${props => props.$active ? 1 : 0.7};
`;

const EventCategory = styled.span<{ $category: string }>`
  display: inline-block;
  padding: 0.25rem 0.75rem;
  border-radius: 9999px;
  font-size: 0.75rem;
  font-weight: 600;
  background: ${props => {
    switch (props.$category) {
      case 'lecture': return '#dbeafe';
      case 'community': return '#fef3c7';
      case 'youth': return '#fce7f3';
      case 'women': return '#f3e8ff';
      case 'education': return '#dcfce7';
      case 'charity': return '#fff7ed';
      default: return '#e5e7eb';
    }
  }};
  color: ${props => {
    switch (props.$category) {
      case 'lecture': return '#1e40af';
      case 'community': return '#92400e';
      case 'youth': return '#9f1239';
      case 'women': return '#6b21a8';
      case 'education': return '#15803d';
      case 'charity': return '#c2410c';
      default: return '#374151';
    }
  }};
  margin-bottom: 0.75rem;
`;

const EventTitle = styled.h3`
  font-size: 1.125rem;
  font-weight: bold;
  color: #1f2937;
  margin-bottom: 0.5rem;
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

// Component
export default function EventsTab({ saving, onSaveStatusChange }: EventsTabProps): React.JSX.Element {
  const [events, setEvents] = useState<Event[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingEvent, setEditingEvent] = useState<Event | null>(null);
  const [formData, setFormData] = useState<Partial<Event>>({
    title: '',
    description: '',
    date: '',
    time: '',
    location: '',
    category: 'lecture',
    speaker: '',
    image_url: '',
    rsvp_enabled: false,
    rsvp_limit: 0,
    is_active: true,
  });

  // Load events from Firebase
  useEffect(() => {
    loadEvents();
  }, []);

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
        category: 'lecture',
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

  return (
    <Card>
      <CardTitle>Events Management</CardTitle>

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
          {events.map(event => (
            <EventCard key={event.id} $active={event.is_active}>
              <EventCategory $category={event.category}>
                {event.category.toUpperCase()}
              </EventCategory>
              
              <EventTitle>{event.title}</EventTitle>
              
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
                  Delete
                </SmallButton>
              </EventActions>
            </EventCard>
          ))}
        </EventsGrid>
      )}

      {/* Modal for Add/Edit Event */}
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
                value={formData.category || 'lecture'}
                onChange={(e) => handleInputChange('category', e.target.value)}
              >
                <option value="lecture">Lecture</option>
                <option value="community">Community</option>
                <option value="youth">Youth</option>
                <option value="women">Women</option>
                <option value="education">Education</option>
                <option value="charity">Charity</option>
                <option value="other">Other</option>
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
    </Card>
  );
}
