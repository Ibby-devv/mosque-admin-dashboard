import React, { useState, useRef } from 'react';
import { storage } from '../firebase';
import { ref, uploadBytesResumable, getDownloadURL, deleteObject } from 'firebase/storage';
import { Upload, X, Image as ImageIcon } from 'lucide-react';

interface ImageUploadProps {
  currentImageUrl?: string;
  onImageUpload: (url: string) => void;
  onImageDelete: () => void;
  storagePath: string; // e.g., 'events/event123' or 'campaigns/campaign456'
  disabled?: boolean;
}

const ImageUpload: React.FC<ImageUploadProps> = ({
  currentImageUrl,
  onImageUpload,
  onImageDelete,
  storagePath,
  disabled = false,
}) => {
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Compress and resize image
  const compressImage = async (file: File): Promise<Blob> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = (event) => {
        const img = new Image();
        img.src = event.target?.result as string;
        img.onload = () => {
          const canvas = document.createElement('canvas');
          const ctx = canvas.getContext('2d');
          if (!ctx) {
            reject(new Error('Failed to get canvas context'));
            return;
          }

          // Calculate new dimensions (max width 800px)
          const maxWidth = 800;
          let width = img.width;
          let height = img.height;

          if (width > maxWidth) {
            height = (height * maxWidth) / width;
            width = maxWidth;
          }

          canvas.width = width;
          canvas.height = height;

          // Draw and compress
          ctx.drawImage(img, 0, 0, width, height);

          // Convert to blob with 75% quality
          canvas.toBlob(
            (blob) => {
              if (blob) {
                resolve(blob);
              } else {
                reject(new Error('Failed to compress image'));
              }
            },
            'image/jpeg',
            0.75
          );
        };
        img.onerror = () => reject(new Error('Failed to load image'));
      };
      reader.onerror = () => reject(new Error('Failed to read file'));
    });
  };

  // Validate file
  const validateFile = (file: File): string | null => {
    // Check file type
    if (!file.type.match(/^image\/(jpeg|jpg|png)$/)) {
      return 'Only JPG and PNG files are allowed';
    }

    // Check file size (max 1MB before compression)
    if (file.size > 1 * 1024 * 1024) {
      return 'File size must be less than 1MB';
    }

    return null;
  };

  // Handle file upload
  const handleFileUpload = async (file: File) => {
    setError(null);

    // Validate file
    const validationError = validateFile(file);
    if (validationError) {
      setError(validationError);
      return;
    }

    try {
      setUploading(true);
      setUploadProgress(0);

      // Compress image
      const compressedBlob = await compressImage(file);

      // Create storage reference
      const storageRef = ref(storage, `${storagePath}/image.jpg`);

      // Upload file
      const uploadTask = uploadBytesResumable(storageRef, compressedBlob, {
        contentType: 'image/jpeg',
      });

      // Monitor upload progress
      uploadTask.on(
        'state_changed',
        (snapshot) => {
          const progress = (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
          setUploadProgress(progress);
        },
        (error) => {
          console.error('Upload error:', error);
          setError('Failed to upload image. Please try again.');
          setUploading(false);
        },
        async () => {
          // Upload complete, get download URL
          const downloadURL = await getDownloadURL(uploadTask.snapshot.ref);
          onImageUpload(downloadURL);
          setUploading(false);
          setUploadProgress(0);
        }
      );
    } catch (err) {
      console.error('Error compressing image:', err);
      setError('Failed to process image. Please try again.');
      setUploading(false);
    }
  };

  // Handle file input change
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      handleFileUpload(file);
    }
    // Reset input value so the same file can be selected again
    e.target.value = '';
  };

  // Handle delete
  const handleDelete = async () => {
    if (!currentImageUrl) return;

    if (!window.confirm('Are you sure you want to delete this image?')) {
      return;
    }

    try {
      // Delete from Firebase Storage
      const storageRef = ref(storage, `${storagePath}/image.jpg`);
      await deleteObject(storageRef);
      onImageDelete();
      setError(null);
    } catch (err: any) {
      console.error('Error deleting image:', err);
      // If the file doesn't exist, just clear the URL anyway
      if (err.code === 'storage/object-not-found') {
        onImageDelete();
        setError(null);
      } else {
        setError('Failed to delete image. Please try again.');
      }
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
      <input
        ref={fileInputRef}
        type="file"
        accept="image/jpeg,image/jpg,image/png"
        onChange={handleFileChange}
        disabled={disabled || uploading}
        style={{ display: 'none' }}
      />

      {/* Current Image Preview */}
      {currentImageUrl && !uploading && (
        <div style={{ position: 'relative', maxWidth: '100%' }}>
          <img
            src={currentImageUrl}
            alt="Uploaded preview"
            style={{
              width: '100%',
              maxHeight: '300px',
              objectFit: 'contain',
              borderRadius: '0.5rem',
              border: '2px solid #e5e7eb',
              backgroundColor: '#f9fafb',
            }}
          />
          <button
            type="button"
            onClick={handleDelete}
            disabled={disabled}
            style={{
              position: 'absolute',
              top: '0.5rem',
              right: '0.5rem',
              background: '#ef4444',
              color: 'white',
              padding: '0.5rem',
              borderRadius: '9999px',
              border: 'none',
              cursor: disabled ? 'not-allowed' : 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              opacity: disabled ? 0.5 : 1,
            }}
            title="Delete image"
          >
            <X size={16} />
          </button>
        </div>
      )}

      {/* Upload Progress */}
      {uploading && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', padding: '1rem', border: '2px dashed #d1d5db', borderRadius: '0.5rem', textAlign: 'center' }}>
          <div style={{ display: 'flex', justifyContent: 'center' }}>
            <Upload style={{ color: '#3b82f6' }} size={32} />
          </div>
          <p style={{ fontSize: '0.875rem', color: '#6b7280', margin: 0 }}>
            Uploading... {Math.round(uploadProgress)}%
          </p>
          <div style={{ width: '100%', backgroundColor: '#e5e7eb', borderRadius: '9999px', height: '0.5rem', overflow: 'hidden' }}>
            <div
              style={{
                backgroundColor: '#3b82f6',
                height: '100%',
                width: `${uploadProgress}%`,
                transition: 'width 0.3s ease',
              }}
            />
          </div>
        </div>
      )}

      {/* Upload/Replace Button */}
      {!uploading && (
        <button
          type="button"
          onClick={() => fileInputRef.current?.click()}
          disabled={disabled}
          style={{
            width: '100%',
            padding: '0.75rem 1rem',
            backgroundColor: currentImageUrl ? '#3b82f6' : '#1e3a8a',
            color: 'white',
            borderRadius: '0.5rem',
            border: 'none',
            fontSize: '1rem',
            fontWeight: '600',
            cursor: disabled ? 'not-allowed' : 'pointer',
            opacity: disabled ? 0.5 : 1,
            transition: 'background-color 0.2s',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '0.5rem',
          }}
          onMouseEnter={(e) => {
            if (!disabled) {
              e.currentTarget.style.backgroundColor = currentImageUrl ? '#2563eb' : '#1e40af';
            }
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.backgroundColor = currentImageUrl ? '#3b82f6' : '#1e3a8a';
          }}
        >
          <ImageIcon size={20} />
          {currentImageUrl ? 'Replace Image' : 'Choose Image'}
        </button>
      )}

      {/* Helper Text */}
      {!currentImageUrl && !uploading && (
        <p style={{ fontSize: '0.75rem', color: '#9ca3af', margin: 0, textAlign: 'center' }}>
          JPG or PNG, max 1MB (auto-resized to 800px width)
        </p>
      )}

      {/* Error Message */}
      {error && (
        <div style={{ padding: '0.75rem', backgroundColor: '#fef2f2', border: '1px solid #fecaca', borderRadius: '0.5rem' }}>
          <p style={{ fontSize: '0.875rem', color: '#dc2626', margin: 0 }}>{error}</p>
        </div>
      )}
    </div>
  );
};

export default ImageUpload;
