# Image UX Flow - Complete Scenarios Documentation

## Overview

This document describes the complete user experience flow for image management in the Admin pages. The ImageUpload component (`/components/admin/ImageUpload.tsx`) handles all image operations including file uploads, URL downloads, previews, and deletion.

---

## Scenario 1: Image File Upload

### User Flow
1. User clicks "📁 Upload Image File" button
2. File browser opens
3. User selects an image file (JPG, PNG, WebP, etc.)
4. Component validates file type and size
5. Image uploads to server (`POST /upload/image`)
6. Preview updates with new image
7. Success toast notification appears

### Implementation Details
- **File Type Validation**: Only accepts files with `image/*` MIME type
- **Size Limit**: 5MB maximum file size
- **API Endpoint**: `POST /api/upload/image` (multipart/form-data)
- **Loading State**: Shows spinner with "Uploading..." text
- **Success Callback**: Calls `onImageUploaded(newImageUrl)`
- **UI Feedback**: Toast success message

### Code Reference
- Function: `handleFileUpload` (lines 25-67)
- Validation: Lines 29-39
- Upload: Lines 41-56

### Error Handling
- Invalid file type → "Please select an image file"
- File too large → "Image size must be less than 5MB"
- Upload failure → Error message from server or "Failed to upload image"
- File input resets after upload attempt (success or failure)

---

## Scenario 2: URL Input and Download

### User Flow
1. User enters image URL in text input field
2. User clicks "🔗 Download" button
3. Component validates URL is not empty
4. Server downloads image from URL (`POST /upload/from-url`)
5. Server saves image and returns new URL
6. Preview updates with downloaded image
7. Success toast notification appears
8. URL input field clears

### Implementation Details
- **URL Validation**: Checks URL is not empty (trim)
- **API Endpoint**: `POST /api/upload/from-url` with `{ url: string }`
- **Loading State**: Shows spinner with "Downloading..." text
- **Button Disable**: Disabled when downloading or URL is empty
- **Success Callback**: Calls `onImageUploaded(newImageUrl)`
- **UI Feedback**: Toast success message

### Code Reference
- Function: `handleUrlDownload` (lines 69-94)
- Validation: Lines 70-73
- Download: Lines 75-86

### Error Handling
- Empty URL → "Please enter an image URL"
- Invalid URL → Server validation error
- Download failure → Error message from server or "Failed to download image from URL"
- Network error → Error caught and displayed

---

## Scenario 3: Existing Image Preview

### User Flow
1. Admin page loads with existing data
2. Component receives `currentImageUrl` prop
3. Component determines if URL is internal or external
4. Image displays in preview area (192px height)
5. Remove button (X) appears on top-right corner

### Implementation Details
- **Internal URL Detection**: URLs starting with `/uploads/` are internal
- **URL Construction**: Internal URLs prepend `NEXT_PUBLIC_API_URL` base
  - Example: `/uploads/image.jpg` → `http://localhost:4000/uploads/image.jpg`
- **External URLs**: Used directly as-is
- **Image Component**: Next.js Image with `fill` layout and `object-contain`
- **Unoptimized**: External images use `unoptimized` prop

### Code Reference
- Function: `getImageSrc` (lines 102-113)
- Preview UI: Lines 124-144
- State initialization: Line 19

### Error Handling
- Image load failure → Next.js Image component shows broken image placeholder
- Invalid URL → Browser default broken image icon

---

## Scenario 4: Image Deletion

### User Flow
1. User sees existing image preview with Remove button (X)
2. User clicks Remove button (top-right red button)
3. Image preview disappears immediately
4. Image URL state clears
5. Upload options remain available
6. Parent component receives empty string via `onImageUploaded('')`

### Implementation Details
- **Button Location**: Absolute positioned top-right corner
- **Styling**: Red background (#DC2626), white X icon, rounded-full
- **Icon**: SVG X mark (24x24 viewBox, 4x4 icon size)
- **State Updates**:
  - `setImageUrl('')`
  - `onImageUploaded('')`
  - `setUrlInput('')` (clears URL input field)

### Code Reference
- Function: `handleRemoveImage` (lines 96-100)
- Button UI: Lines 133-142

### Notes
- No confirmation dialog (immediate deletion)
- Deletes from component state only (database update handled by parent form submit)
- User can immediately upload new image after deletion

---

## Scenario 5: Upload/Download Failure Fallback

### User Flow
1. User attempts upload or download
2. Operation fails (network error, invalid file, server error)
3. Error toast notification appears
4. Previous state maintained (image doesn't change)
5. Loading indicator stops
6. User can retry operation

### Implementation Details
- **Try-Catch Blocks**: All async operations wrapped in try-catch
- **Error Extraction**:
  - Priority 1: `error.response?.data?.message`
  - Priority 2: Generic fallback message
- **State Rollback**: Failed operations don't change `imageUrl` state
- **Console Logging**: Errors logged to console for debugging
- **File Input Reset**: File input cleared even on failure (line 63-65)

### Code Reference
- Upload error handling: Lines 57-66
- Download error handling: Lines 87-93

### Error Messages
- **File Upload**:
  - Invalid type → "Please select an image file"
  - Too large → "Image size must be less than 5MB"
  - Server error → Server message or "Failed to upload image"
- **URL Download**:
  - Empty URL → "Please enter an image URL"
  - Server error → Server message or "Failed to download image from URL"

### Network Error Handling
- Axios catches network errors
- Error response structure: `error.response?.data?.message`
- Fallback to generic message if server doesn't provide details

---

## Scenario 6: Loading State Display

### User Flow
1. User initiates upload or download
2. Appropriate loading indicator appears immediately
3. Interactive elements disable during operation
4. Spinner animation shows progress
5. Operation completes (success or failure)
6. Loading state clears, UI becomes interactive again

### Implementation Details

#### Upload Loading State
- **State Variable**: `uploading` (boolean)
- **UI Changes**:
  - Upload button background → gray (#F3F4F6)
  - Cursor → not-allowed
  - Text → "Uploading..." with spinner icon
- **Spinner**: Rotating circle SVG with tailwind `animate-spin`
- **Duration**: Controlled by `setUploading(true/false)` in try-finally

#### Download Loading State
- **State Variable**: `downloading` (boolean)
- **UI Changes**:
  - Download button disabled
  - Background → gray (#D1D5DB)
  - Text → "Downloading..." with spinner icon
  - URL input field disabled
- **Spinner**: Same rotating circle SVG
- **Duration**: Controlled by `setDownloading(true/false)` in try-finally

### Code Reference
- Upload loading: Lines 42, 62, 160-178
- Download loading: Lines 76, 92, 190-213
- Spinner SVG: Lines 168-171, 204-207

### Loading Indicators
- **Spinner Design**:
  - Circle with 25% opacity stroke
  - Rotating arc with 75% opacity fill
  - Size: 16x16 (h-4 w-4)
  - Color: Gray-600 (upload), current color (download)
- **Animation**: Tailwind `animate-spin` utility class

---

## Component Props Interface

```typescript
interface ImageUploadProps {
  currentImageUrl?: string | null;  // Existing image URL from database
  onImageUploaded: (imageUrl: string) => void;  // Callback when image changes
  label?: string;  // Form label (default: "Image")
}
```

---

## Component State

```typescript
const [imageUrl, setImageUrl] = useState(currentImageUrl || '');  // Current displayed image
const [urlInput, setUrlInput] = useState('');  // URL input field value
const [uploading, setUploading] = useState(false);  // File upload in progress
const [downloading, setDownloading] = useState(false);  // URL download in progress
const fileInputRef = useRef<HTMLInputElement>(null);  // File input reference for reset
```

---

## Backend API Endpoints

### POST /api/upload/image
- **Content-Type**: `multipart/form-data`
- **Request Body**: FormData with `image` field
- **Response**: `{ image: { url: string } }`
- **Validation**: File type, size, format
- **Storage**: Saves to `/uploads/` directory

### POST /api/upload/from-url
- **Content-Type**: `application/json`
- **Request Body**: `{ url: string }`
- **Response**: `{ image: { url: string } }`
- **Process**: Downloads from URL → Validates → Saves to `/uploads/` → Returns new URL

---

## Image URL Types

### Internal URLs
- **Format**: `/uploads/filename.ext`
- **Display**: Prepends `NEXT_PUBLIC_API_URL` (without `/api`)
- **Example**: `/uploads/cartridge-123.jpg` → `http://localhost:4000/uploads/cartridge-123.jpg`

### External URLs
- **Format**: Full URL (http:// or https://)
- **Display**: Used directly
- **Example**: `https://example.com/image.jpg`

---

## Browser Support

- **File Upload**: HTML5 File API (all modern browsers)
- **Drag & Drop**: Not currently implemented (listed as optional in Phase 4.2)
- **Image Preview**: Next.js Image component (automatic optimization)
- **Animations**: CSS animations (Tailwind animate-spin)

---

## Accessibility

- **File Input**: Hidden but accessible via label click
- **Labels**: Semantic label elements for screen readers
- **Buttons**: Type="button" to prevent form submission
- **Alt Text**: "Preview" alt text for images
- **Color Contrast**: Red delete button (#DC2626) on images
- **Focus States**: Tailwind focus rings on inputs

---

## Responsive Design

- **Preview Height**: Fixed 192px (h-48)
- **Preview Width**: Full width (w-full)
- **Image Fit**: `object-contain` (maintains aspect ratio)
- **Mobile**: Touch-friendly button sizes (p-2, p-4)
- **Layout**: Flexbox for URL input + button row

---

## Security Considerations

- **File Type Validation**: Client-side check (image/*)
- **Size Limit**: 5MB client-side enforcement
- **Server Validation**: Backend must re-validate all uploads
- **URL Sanitization**: Server should validate and sanitize URLs
- **CORS**: External image downloads may require CORS handling
- **XSS Prevention**: Image URLs should be sanitized

---

## Testing Checklist

### Scenario 1: File Upload ✅
- [ ] JPG file uploads successfully
- [ ] PNG file uploads successfully
- [ ] WebP file uploads successfully
- [ ] Non-image file shows error
- [ ] File > 5MB shows error
- [ ] Loading spinner appears during upload
- [ ] Preview updates on success
- [ ] Toast notification appears
- [ ] File input resets after upload

### Scenario 2: URL Download ✅
- [ ] Valid URL downloads successfully
- [ ] Empty URL shows error
- [ ] Invalid URL shows server error
- [ ] Loading spinner appears during download
- [ ] Preview updates on success
- [ ] Toast notification appears
- [ ] URL input clears on success

### Scenario 3: Existing Image ✅
- [ ] Internal URLs display correctly
- [ ] External URLs display correctly
- [ ] Broken URLs show placeholder
- [ ] Image maintains aspect ratio
- [ ] Remove button appears

### Scenario 4: Deletion ✅
- [ ] Remove button works
- [ ] Preview clears immediately
- [ ] Can upload new image after deletion
- [ ] Parent component receives empty string

### Scenario 5: Error Handling ✅
- [ ] Network errors show toast
- [ ] Server errors show message
- [ ] Previous state maintained on failure
- [ ] Can retry after failure

### Scenario 6: Loading States ✅
- [ ] Upload button shows spinner
- [ ] Download button shows spinner
- [ ] Buttons disabled during operation
- [ ] Loading state clears after completion

---

## Future Enhancements (Optional)

### Drag & Drop Support
- Add onDrop, onDragOver, onDragLeave handlers
- Visual feedback for drag state
- Drop zone styling

### Image Cropping
- Integrate image cropping library
- Allow aspect ratio selection
- Preview before upload

### Multiple Images
- Support multiple file selection
- Gallery view
- Image ordering

### Progress Bar
- Replace spinner with progress bar
- Show upload percentage
- Estimated time remaining

### Image Optimization
- Client-side compression before upload
- Format conversion (to WebP)
- Automatic resizing

---

## Conclusion

The ImageUpload component provides a complete, robust solution for image management in Admin pages. All 6 scenarios are implemented with proper error handling, loading states, and user feedback. The component is production-ready and follows React best practices.
