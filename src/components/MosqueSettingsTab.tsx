import React, { useState, useEffect, useMemo } from 'react';
import styled, { keyframes, css } from 'styled-components';
import { Save, MapPin, ExternalLink, Info, AlertCircle, Search, CheckCircle, Clock } from 'lucide-react';
import { getFunctions, httpsCallable } from 'firebase/functions';
import { MosqueSettingsTabProps } from '../types';
import { Theme, media } from '../constants/theme';
import { usePermissions } from '../hooks/usePermissions';
import { Permission } from '../constants/roles';

const Card = styled.div`
  background: ${Theme.colors.surface.card};
  border: 1px solid ${Theme.colors.border.soft};
  border-radius: ${Theme.radius.lg};
  box-shadow: ${Theme.shadow.card};
  padding: ${Theme.spacing.lg};

  ${media.sm} {
    padding: ${Theme.spacing.xl};
  }

  ${media.md} {
    padding: ${Theme.spacing.xxl};
  }
`;

const CardTitle = styled.h2`
  font-size: ${Theme.typography.h2};
  font-weight: bold;
  color: ${Theme.colors.text.strong};
  margin-bottom: ${Theme.spacing.xl};

  ${media.md} {
    font-size: ${Theme.typography.h1};
  }
`;

const SectionTitle = styled.h3`
  font-size: ${Theme.typography.h3};
  font-weight: 600;
  color: ${Theme.colors.text.strong};
  margin: ${Theme.spacing.xl} 0 ${Theme.spacing.md} 0;
  display: flex;
  align-items: center;
  gap: ${Theme.spacing.sm};

  ${media.md} {
    font-size: ${Theme.typography.h2};
  }
`;

const SettingsForm = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${Theme.spacing.lg};
`;

const FormGroup = styled.div<{ marginBottom?: string }>`
  margin-bottom: ${props => props.marginBottom || '0'};
`;

const Label = styled.label`
  display: block;
  font-size: ${Theme.typography.small};
  font-weight: 600;
  color: ${Theme.colors.text.base};
  margin-bottom: ${Theme.spacing.sm};

  ${media.md} {
    font-size: ${Theme.typography.body};
  }
`;

const Input = styled.input`
  width: 100%;
  padding: ${Theme.spacing.md} ${Theme.spacing.lg};
  border: 1px solid ${Theme.colors.border.base};
  border-radius: ${Theme.radius.md};
  font-size: ${Theme.typography.body};
  outline: none;
  transition: all 0.2s;
  box-sizing: border-box;
  min-height: 44px; /* Touch-friendly */

  ${media.md} {
    font-size: 16px;
  }

  &:focus {
    border-color: ${Theme.colors.brand.navy[700]};
    box-shadow: 0 0 0 3px ${Theme.colors.accent.blueSoft};
  }

  &:disabled {
    background: ${Theme.colors.surface.muted};
    cursor: not-allowed;
  }
`;

const Select = styled.select`
  width: 100%;
  padding: ${Theme.spacing.md} ${Theme.spacing.lg};
  border: 1px solid ${Theme.colors.border.base};
  border-radius: ${Theme.radius.md};
  font-size: ${Theme.typography.body};
  outline: none;
  transition: all 0.2s;
  box-sizing: border-box;
  background: ${Theme.colors.surface.base};
  min-height: 44px; /* Touch-friendly */

  ${media.md} {
    font-size: 16px;
  }

  &:focus {
    border-color: ${Theme.colors.brand.navy[700]};
    box-shadow: 0 0 0 3px ${Theme.colors.accent.blueSoft};
  }

  &:disabled {
    background: ${Theme.colors.surface.muted};
    cursor: not-allowed;
  }
`;

const TwoColumnGrid = styled.div`
  display: grid;
  grid-template-columns: 1fr;
  gap: ${Theme.spacing.lg};

  ${media.sm} {
    grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  }
`;

const InfoBox = styled.div`
  margin-top: ${Theme.spacing.md};
  padding: ${Theme.spacing.md};
  background: ${Theme.colors.accent.blueSoft};
  border: 1px solid ${Theme.colors.accent.blue};
  border-radius: ${Theme.radius.md};
  font-size: ${Theme.typography.small};
  color: ${Theme.colors.brand.navy[700]};
  box-shadow: ${Theme.shadow.soft};
`;

const HelpText = styled.p`
  font-size: ${Theme.typography.small};
  color: ${Theme.colors.text.muted};
  margin-top: ${Theme.spacing.xs};
  margin-bottom: 0;
`;

// 🔄 Pulse animation for unsaved changes
const pulse = keyframes`
  0% { box-shadow: 0 0 0 0 rgba(245, 158, 11, 0.6); }
  70% { box-shadow: 0 0 0 10px rgba(245, 158, 11, 0); }
  100% { box-shadow: 0 0 0 0 rgba(245, 158, 11, 0); }
`;

const SaveButton = styled.button<{ $dirty: boolean }>`
  display: flex;
  align-items: center;
  justify-content: center;
  gap: ${Theme.spacing.sm};
  background: ${props => props.$dirty ? Theme.colors.status.warning : Theme.colors.brand.navy[700]};
  color: ${Theme.colors.text.inverse};
  padding: ${Theme.spacing.md} ${Theme.spacing.xl};
  border-radius: ${Theme.radius.md};
  font-weight: 600;
  font-size: ${Theme.typography.body};
  border: none;
  cursor: pointer;
  margin-top: ${Theme.spacing.xl};
  transition: all 0.2s;
  min-height: 48px; /* Extra touch-friendly */
  box-shadow: ${Theme.shadow.soft};

  ${media.md} {
    padding: ${Theme.spacing.lg} ${Theme.spacing.xxl};
    font-size: 16px;
  }

  &:hover {
    background: ${props => props.$dirty ? Theme.colors.brand.gold[600] : Theme.colors.brand.navy[600]};
    transform: translateY(-1px);
    box-shadow: ${Theme.shadow.card};
  }

  &:active {
    transform: translateY(0);
  }

  &:disabled {
    background: ${Theme.colors.text.muted};
    cursor: not-allowed;
    opacity: 0.6;
  }

  ${props => props.$dirty && css`animation: ${pulse} 2s infinite;`}
`;

const CoordinateHelper = styled.div`
  margin-top: ${Theme.spacing.md};
  padding: ${Theme.spacing.md};
  background: ${Theme.colors.accent.blueSoft};
  border-radius: ${Theme.radius.md};
  border-left: 4px solid ${Theme.colors.accent.blue};
  box-shadow: ${Theme.shadow.soft};
`;

const HelperHeader = styled.div`
  display: flex;
  align-items: center;
  gap: ${Theme.spacing.sm};
  margin-bottom: ${Theme.spacing.sm};
`;

const HelperTitle = styled.div`
  font-weight: 600;
  color: ${Theme.colors.brand.navy[700]};
  font-size: ${Theme.typography.body};
`;

const HelperSteps = styled.ol`
  margin: 0;
  padding-left: ${Theme.spacing.xl};
  color: ${Theme.colors.brand.navy[700]};
  font-size: ${Theme.typography.small};

  ${media.md} {
    font-size: ${Theme.typography.body};
  }
`;

const HelperStep = styled.li`
  margin-bottom: ${Theme.spacing.xs};
`;

const MapButton = styled.a`
  display: inline-flex;
  align-items: center;
  gap: ${Theme.spacing.sm};
  padding: ${Theme.spacing.sm} ${Theme.spacing.md};
  background: ${Theme.colors.brand.navy[700]};
  color: ${Theme.colors.text.inverse};
  border-radius: ${Theme.radius.sm};
  font-size: ${Theme.typography.small};
  font-weight: 500;
  text-decoration: none;
  transition: all 0.2s;
  margin-top: ${Theme.spacing.sm};
  min-height: 40px; /* Touch-friendly */

  ${media.md} {
    font-size: ${Theme.typography.body};
    padding: ${Theme.spacing.md} ${Theme.spacing.lg};
  }

  &:hover {
    background: ${Theme.colors.brand.navy[600]};
    transform: translateY(-1px);
  }

  &:active {
    transform: translateY(0);
  }
  }
`;

const ErrorMessage = styled.div`
  display: flex;
  align-items: center;
  gap: ${Theme.spacing.xs};
  margin-top: ${Theme.spacing.xs};
  font-size: ${Theme.typography.small};
  color: ${Theme.colors.status.error};
`;

const InputWithValidation = styled.div`
  position: relative;
`;

const ValidationIcon = styled.div<{ $isValid: boolean }>`
  position: absolute;
  right: ${Theme.spacing.md};
  top: ${Theme.spacing.md};
  color: ${props => props.$isValid ? Theme.colors.status.success : Theme.colors.status.error};
`;

const AddressInputGroup = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${Theme.spacing.sm};

  ${media.sm} {
    flex-direction: row;
    align-items: flex-start;
  }
`;

const AddressInputWrapper = styled.div`
  flex: 2;
`;

const GeocodeButton = styled.button`
  display: flex;
  align-items: center;
  justify-content: center;
  gap: ${Theme.spacing.sm};
  padding: ${Theme.spacing.md} ${Theme.spacing.lg};
  min-height: 44px;
  background: ${Theme.colors.surface.card};
  color: ${Theme.colors.brand.navy[700]};
  border: 2px solid ${Theme.colors.brand.navy[700]};
  border-radius: ${Theme.radius.md};
  font-weight: 600;
  font-size: ${Theme.typography.body};
  cursor: pointer;
  transition: all 0.2s;
  white-space: nowrap;

  ${media.sm} {
    padding: ${Theme.spacing.sm} ${Theme.spacing.lg};
    flex: 1;
  }

  &:hover {
    background: ${Theme.colors.brand.navy[700]};
    color: white;
    transform: translateY(-1px);
    box-shadow: ${Theme.shadow.soft};
  }

  &:disabled {
    background: ${Theme.colors.surface.muted};
    color: ${Theme.colors.text.subtle};
    border-color: ${Theme.colors.border.base};
    cursor: not-allowed;
    transform: none;
  }
`;

const GeocodeResultBox = styled.div<{ $success: boolean }>`
  margin-top: ${Theme.spacing.sm};
  padding: ${Theme.spacing.md};
  background: ${props => props.$success ? Theme.colors.status.successLight : Theme.colors.status.errorLight};
  border: 1px solid ${props => props.$success ? Theme.colors.status.success : Theme.colors.status.error};
  border-radius: ${Theme.radius.md};
  display: flex;
  align-items: flex-start;
  gap: ${Theme.spacing.sm};
`;

const GeocodeResultIcon = styled.div<{ $success: boolean }>`
  color: ${props => props.$success ? Theme.colors.status.successDark : Theme.colors.status.errorDark};
  flex-shrink: 0;
`;

const GeocodeResultText = styled.div`
  flex: 1;
  font-size: ${Theme.typography.small};
`;

const GeocodeResultTitle = styled.div<{ $success: boolean }>`
  font-size: ${Theme.typography.body};
  font-weight: 600;
  color: ${props => props.$success ? Theme.colors.status.successDark : Theme.colors.status.errorDark};
  margin-bottom: ${Theme.spacing.xs};
`;

const GeocodeResultMessage = styled.div<{ $success: boolean }>`
  font-size: ${Theme.typography.small};
  color: ${props => props.$success ? Theme.colors.status.success : Theme.colors.status.error};
`;

interface GeocodeResult {
  latitude: number;
  longitude: number;
  formatted_address: string;
}

// Curated list of common timezones for Muslim-majority regions
const COMMON_TIMEZONES = [
  'Australia/Sydney',
  'Australia/Melbourne',
  'Australia/Brisbane',
  'Australia/Perth',
  'Australia/Adelaide',
  'Asia/Dubai',
  'Asia/Riyadh',
  'Asia/Kuwait',
  'Asia/Qatar',
  'Asia/Karachi',
  'Asia/Dhaka',
  'Asia/Kolkata',
  'Asia/Jakarta',
  'Asia/Kuala_Lumpur',
  'Asia/Singapore',
  'Europe/London',
  'Europe/Istanbul',
  'America/New_York',
  'America/Chicago',
  'America/Los_Angeles',
  'America/Toronto',
];

// Helper to format timezone for display
const formatTimezoneLabel = (tz: string): string => {
  const city = tz.split('/').pop()?.replace(/_/g, ' ') || tz;
  try {
    const offset = new Intl.DateTimeFormat('en-US', {
      timeZone: tz,
      timeZoneName: 'short',
    }).formatToParts(new Date())
      .find(part => part.type === 'timeZoneName')?.value || '';
    return `${city} (${offset})`;
  } catch {
    return city;
  }
};

export default function MosqueSettingsTab({ mosqueSettings, onChange, onSave, saving }: MosqueSettingsTabProps): React.JSX.Element {
  const { hasPermission } = usePermissions();
  const canEdit = hasPermission(Permission.EDIT_MOSQUE_SETTINGS);
  
  const [errors, setErrors] = useState({ latitude: '', longitude: '' });
  const [geocoding, setGeocoding] = useState(false);
  const [geocodeResult, setGeocodeResult] = useState<{ success: boolean; message: string } | null>(null);
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);

  // Get all available timezones from Intl API
  const allTimezones = useMemo(() => {
    try {
      // TypeScript doesn't know about this new API yet, but it exists in modern browsers
      return (Intl as any).supportedValuesOf('timeZone') as string[];
    } catch {
      // Fallback for older browsers
      return COMMON_TIMEZONES;
    }
  }, []);

  // Group timezones by region for better UX
  const timezonesByRegion = useMemo(() => {
    const grouped: Record<string, string[]> = {};
    allTimezones.forEach((tz: string) => {
      const region = tz.split('/')[0];
      if (!grouped[region]) {
        grouped[region] = [];
      }
      grouped[region].push(tz);
    });
    return grouped;
  }, [allTimezones]);

  const validateCoordinate = (value: string | number | undefined, type: 'latitude' | 'longitude'): string => {
    if (value === undefined || value === null || value === '') return '';
    const num = parseFloat(String(value).trim());
    if (isNaN(num)) return 'Must be a valid number';
    if (type === 'latitude' && (num < -90 || num > 90)) return 'Latitude must be between -90 and 90';
    if (type === 'longitude' && (num < -180 || num > 180)) return 'Longitude must be between -180 and 180';
    return '';
  };

  const handleChange = (field: keyof typeof mosqueSettings, value: string | number | boolean): void => {
    setHasUnsavedChanges(true);
    onChange({ ...mosqueSettings, [field]: value });
  };

  const handleCoordinateChange = (field: 'latitude' | 'longitude', value: string) => {
    const error = validateCoordinate(value, field);
    setErrors(prev => ({ ...prev, [field]: error }));
    setHasUnsavedChanges(true);
    let numValue = parseFloat(value) || 0;
    handleChange(field, numValue);
  };

  const handleSave = async () => {
    // Normalize social links before saving to ensure consistent URLs in Firestore
    const normalizedFacebook = normalizeFacebook(mosqueSettings?.facebook || '');
    const normalizedInstagram = normalizeInstagram(mosqueSettings?.instagram || '');
    if ((mosqueSettings?.facebook || '') !== normalizedFacebook || (mosqueSettings?.instagram || '') !== normalizedInstagram) {
      onChange({ ...mosqueSettings, facebook: normalizedFacebook, instagram: normalizedInstagram });
      setHasUnsavedChanges(true);
    }
    await onSave();
    setHasUnsavedChanges(false);
  };

  const handleGeocodeAddress = async () => {
    const address = mosqueSettings?.address?.trim();
    if (!address) {
      setGeocodeResult({ success: false, message: 'Please enter an address first' });
      return;
    }
    setGeocoding(true);
    setGeocodeResult(null);
    try {
      const functions = getFunctions(undefined, 'australia-southeast1');
      const geocodeAddress = httpsCallable<{ address: string }, GeocodeResult>(functions, 'geocodeAddress');
      const result = await geocodeAddress({ address });
      const data = result.data;
      onChange({ ...mosqueSettings, latitude: data.latitude, longitude: data.longitude, address: data.formatted_address });
      setHasUnsavedChanges(true);
      setGeocodeResult({ success: true, message: `Found coordinates: ${data.latitude.toFixed(6)}, ${data.longitude.toFixed(6)}` });
      setErrors({ latitude: '', longitude: '' });
      setTimeout(() => setGeocodeResult(null), 5000);
    } catch (error: any) {
      console.error('Geocoding error:', error);
      let errorMessage = error.message || 'Failed to find location. Please check the address and try again.';
      setGeocodeResult({ success: false, message: errorMessage });
    } finally {
      setGeocoding(false);
    }
  };

  useEffect(() => {
    if (mosqueSettings) {
      setErrors({
        latitude: validateCoordinate(mosqueSettings.latitude, 'latitude'),
        longitude: validateCoordinate(mosqueSettings.longitude, 'longitude')
      });
    }
  }, [mosqueSettings]);

  // Calculation methods using adhan package naming convention
  const calculationMethods = [
    { value: 'MuslimWorldLeague', label: 'Muslim World League (MWL)' },
    { value: 'Egyptian', label: 'Egyptian General Authority of Survey' },
    { value: 'Karachi', label: 'University of Islamic Sciences, Karachi' },
    { value: 'UmmAlQura', label: 'Umm Al-Qura University, Makkah' },
    { value: 'Dubai', label: 'Dubai' },
    { value: 'MoonsightingCommittee', label: 'Moonsighting Committee' },
    { value: 'NorthAmerica', label: 'Islamic Society of North America (ISNA)' },
    { value: 'Kuwait', label: 'Kuwait' },
    { value: 'Qatar', label: 'Qatar' },
    { value: 'Singapore', label: 'Majlis Ugama Islam Singapura, Singapore' },
    { value: 'Tehran', label: 'Institute of Geophysics, University of Tehran' },
    { value: 'Turkey', label: 'Diyanet İşleri Başkanlığı, Turkey' },
  ];

  const hasErrors = !!errors.latitude || !!errors.longitude;

  // --- Social link normalization helpers ---
  const normalizeFacebook = (raw: string): string => {
    const v = (raw || '').trim();
    if (!v) return '';
    if (v.startsWith('http://') || v.startsWith('https://')) return v;
    let s = v.startsWith('@') ? v.slice(1) : v;
    if (s.startsWith('www.')) s = s.slice(4);
    if (s.startsWith('facebook.com/')) return `https://${s}`;
    if (s === 'facebook.com') return 'https://facebook.com/';
    return `https://facebook.com/${s}`;
  };

  const normalizeInstagram = (raw: string): string => {
    const v = (raw || '').trim();
    if (!v) return '';
    if (v.startsWith('http://') || v.startsWith('https://')) return v;
    let s = v.startsWith('@') ? v.slice(1) : v;
    if (s.startsWith('www.')) s = s.slice(4);
    if (s.startsWith('instagram.com/')) return `https://${s}`;
    if (s === 'instagram.com') return 'https://instagram.com/';
    return `https://instagram.com/${s}`;
  };



  return (
    <Card>
      <CardTitle>Mosque Information</CardTitle>
      
      <SettingsForm>
        <FormGroup>
          <Label>Mosque Name</Label>
          <Input
            type="text"
            value={mosqueSettings?.name || ''}
            onChange={(e) => handleChange('name', e.target.value)}
          />
        </FormGroup>

        <FormGroup>
          <Label>Address</Label>
          <AddressInputGroup>
            <AddressInputWrapper>
              <Input
                type="text"
                value={mosqueSettings?.address || ''}
                onChange={(e) => handleChange('address', e.target.value)}
                placeholder="e.g., 123 Main Street, Yagoona NSW 2199"
              />
            </AddressInputWrapper>
            <GeocodeButton 
              onClick={handleGeocodeAddress}
              disabled={geocoding || !mosqueSettings?.address?.trim()}
            >
              <Search size={16} />
              {geocoding ? 'Searching...' : 'Search'}
            </GeocodeButton>
          </AddressInputGroup>
          <HelpText>
            Enter your mosque's full address and click Search to automatically find coordinates
          </HelpText>
          {geocodeResult && (
            <GeocodeResultBox $success={geocodeResult.success}>
              <GeocodeResultIcon $success={geocodeResult.success}>
                {geocodeResult.success ? <CheckCircle size={16} /> : <AlertCircle size={16} />}
              </GeocodeResultIcon>
              <GeocodeResultText>
                <GeocodeResultTitle $success={geocodeResult.success}>
                  {geocodeResult.success ? 'Location Found!' : 'Search Failed'}
                </GeocodeResultTitle>
                <GeocodeResultMessage $success={geocodeResult.success}>
                  {geocodeResult.message}
                </GeocodeResultMessage>
              </GeocodeResultText>
            </GeocodeResultBox>
          )}
        </FormGroup>

        <TwoColumnGrid>
          <FormGroup>
            <Label>Phone</Label>
            <Input
              type="text"
              value={mosqueSettings?.phone || ''}
              onChange={(e) => handleChange('phone', e.target.value)}
            />
          </FormGroup>

          <FormGroup>
            <Label>Email</Label>
            <Input
              type="email"
              value={mosqueSettings?.email || ''}
              onChange={(e) => handleChange('email', e.target.value)}
            />
          </FormGroup>
        </TwoColumnGrid>

        <FormGroup>
          <Label>Website</Label>
          <Input
            type="text"
            value={mosqueSettings?.website || ''}
            onChange={(e) => handleChange('website', e.target.value)}
          />
        </FormGroup>

        <FormGroup>
          <Label>Imam</Label>
          <Input
            type="text"
            value={mosqueSettings?.imam || ''}
            onChange={(e) => handleChange('imam', e.target.value)}
          />
        </FormGroup>

        <SectionTitle>
          <ExternalLink size={20} />
          Social Links
        </SectionTitle>

        <TwoColumnGrid>
          <FormGroup>
            <Label>Facebook</Label>
            <Input
              type="text"
              value={mosqueSettings?.facebook || ''}
              onChange={(e) => handleChange('facebook', e.target.value)}
              onBlur={(e) => handleChange('facebook', normalizeFacebook(e.target.value))}
              placeholder="https://facebook.com/yourpage or @yourpage"
            />
            <HelpText>Paste full URL or handle; we'll store a full URL.</HelpText>
          </FormGroup>

          <FormGroup>
            <Label>Instagram</Label>
            <Input
              type="text"
              value={mosqueSettings?.instagram || ''}
              onChange={(e) => handleChange('instagram', e.target.value)}
              onBlur={(e) => handleChange('instagram', normalizeInstagram(e.target.value))}
              placeholder="https://instagram.com/yourhandle or @yourhandle"
            />
            <HelpText>Paste full URL or handle; we'll store a full URL.</HelpText>
          </FormGroup>
        </TwoColumnGrid>

        <SectionTitle>
          <MapPin size={20} />
          Location Settings (for Prayer Time Calculation)
        </SectionTitle>

        <InfoBox>
          <strong>📍 Location is used to automatically calculate all prayer times</strong>
          <div style={{ marginTop: '0.5rem' }}>
            Once you save your mosque location, all Adhan times will be automatically calculated from Aladhan API based on astronomical data.
            You only need to set the Iqama times in the Prayer Times tab.
          </div>
        </InfoBox>

        <TwoColumnGrid>
          <FormGroup>
            <Label>Latitude</Label>
            <InputWithValidation>
              <Input
                type="text"
                value={mosqueSettings?.latitude || ''}
                onChange={(e) => handleCoordinateChange('latitude', e.target.value)}
                placeholder="-33.8688"
                style={{ 
                  borderColor: errors.latitude ? Theme.colors.status.error : undefined,
                  paddingRight: '2.5rem'
                }}
              />
              {mosqueSettings?.latitude !== undefined && mosqueSettings?.latitude !== null && mosqueSettings?.latitude !== 0 && !errors.latitude && (
                <ValidationIcon $isValid={true}>
                  ✓
                </ValidationIcon>
              )}
              {errors.latitude && (
                <ValidationIcon $isValid={false}>
                  <AlertCircle size={16} />
                </ValidationIcon>
              )}
            </InputWithValidation>
            <HelpText>Auto-filled when you search address above</HelpText>
            {errors.latitude && (
              <ErrorMessage>
                <AlertCircle size={12} />
                {errors.latitude}
              </ErrorMessage>
            )}
          </FormGroup>

          <FormGroup>
            <Label>Longitude</Label>
            <InputWithValidation>
              <Input
                type="text"
                value={mosqueSettings?.longitude || ''}
                onChange={(e) => handleCoordinateChange('longitude', e.target.value)}
                placeholder="151.2093"
                style={{ 
                  borderColor: errors.longitude ? Theme.colors.status.error : undefined,
                  paddingRight: '2.5rem'
                }}
              />
              {mosqueSettings?.longitude !== undefined && mosqueSettings?.longitude !== null && mosqueSettings?.longitude !== 0 && !errors.longitude && (
                <ValidationIcon $isValid={true}>
                  ✓
                </ValidationIcon>
              )}
              {errors.longitude && (
                <ValidationIcon $isValid={false}>
                  <AlertCircle size={16} />
                </ValidationIcon>
              )}
            </InputWithValidation>
            <HelpText>Auto-filled when you search address above</HelpText>
            {errors.longitude && (
              <ErrorMessage>
                <AlertCircle size={12} />
                {errors.longitude}
              </ErrorMessage>
            )}
          </FormGroup>
        </TwoColumnGrid>

        <CoordinateHelper>
          <HelperHeader>
            <Info size={16} color={Theme.colors.accent.blue} />
            <HelperTitle>Manual coordinate entry (optional)</HelperTitle>
          </HelperHeader>
          <HelperSteps>
            <HelperStep>Click the button below to open Google Maps</HelperStep>
            <HelperStep>Search for your mosque location</HelperStep>
            <HelperStep>Right-click on the exact location</HelperStep>
            <HelperStep>Select the coordinates from the popup menu</HelperStep>
            <HelperStep>Copy and paste them into the fields above</HelperStep>
          </HelperSteps>
          <MapButton 
            href="https://www.google.com/maps" 
            target="_blank" 
            rel="noopener noreferrer"
          >
            <ExternalLink size={16} />
            Open Google Maps
          </MapButton>
        </CoordinateHelper>

        <FormGroup>
          <Label>Prayer Time Calculation Method</Label>
          <Select
            value={mosqueSettings?.calculation_method || 'MuslimWorldLeague'}
            onChange={(e) => handleChange('calculation_method', e.target.value)}
          >
            {calculationMethods.map(method => (
              <option key={method.value} value={method.value}>
                {method.label}
              </option>
            ))}
          </Select>
          <HelpText>
            This determines how prayer times are calculated. MWL (Muslim World League) is commonly used globally.
          </HelpText>
        </FormGroup>

        <SectionTitle>
          <Clock size={20} />
          Timezone Settings
        </SectionTitle>

        <InfoBox>
          <strong>🌍 Timezone affects all date and time displays</strong>
          <div style={{ marginTop: '0.5rem' }}>
            This timezone will be used for displaying dates, calculating "next prayer" countdowns, and showing event times in the mobile app.
            If not set, the app defaults to Australia/Sydney.
          </div>
        </InfoBox>

        <FormGroup>
          <Label>Timezone</Label>
          <Select
            value={mosqueSettings?.timezone || 'Australia/Sydney'}
            onChange={(e) => handleChange('timezone', e.target.value)}
          >
            <optgroup label="Common Timezones">
              {COMMON_TIMEZONES.map(tz => (
                <option key={tz} value={tz}>
                  {formatTimezoneLabel(tz)}
                </option>
              ))}
            </optgroup>
            <optgroup label="All Timezones (Grouped by Region)">
              {Object.entries(timezonesByRegion).map(([region, timezones]) => (
                <optgroup key={region} label={`─── ${region} ───`}>
                  {timezones.map((tz: string) => (
                    <option key={tz} value={tz}>
                      {formatTimezoneLabel(tz)}
                    </option>
                  ))}
                </optgroup>
              ))}
            </optgroup>
          </Select>
          <HelpText>
            Select the IANA timezone for your mosque location. This ensures accurate time displays across different devices.
          </HelpText>
        </FormGroup>
      </SettingsForm>

       <SaveButton
        onClick={handleSave}
        disabled={saving || hasErrors || !canEdit}
        $dirty={hasUnsavedChanges}
        title={hasErrors ? 'Please fix coordinate errors before saving' : undefined}
      >
        <Save size={20} />
        {saving ? 'Saving...' : hasUnsavedChanges ? 'Save Changes' : 'Saved'}
      </SaveButton>
    </Card>
  );
}
