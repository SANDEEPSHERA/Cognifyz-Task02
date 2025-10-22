# Advanced Form Application

A comprehensive web application featuring inline styles, client-side and server-side form validation, and temporary data storage.

## Features

### 🎨 **Inline Styles & Modern UI**
- Responsive design with gradient backgrounds
- Modern form styling with smooth animations
- Progress bar showing form completion
- Real-time visual feedback for form validation
- Mobile-friendly responsive layout

### 📝 **Complex Form Structure**
- **Personal Information**: Name, email, phone, date of birth
- **Address Information**: Street, city, state, ZIP code
- **Preferences**: Gender, interests, experience level, bio
- **Terms & Conditions**: Required agreement checkbox

### ✅ **Client-Side Validation**
- Real-time field validation on blur events
- Email format validation
- Phone number format validation
- Date of birth age validation (13-120 years)
- ZIP code format validation
- Required field validation
- Visual feedback with success/error states

### 🔒 **Server-Side Validation**
- Comprehensive server-side validation for all fields
- Duplicate email detection
- Data sanitization to prevent XSS attacks
- Age verification for date of birth
- Phone number format validation
- Address validation
- Experience level validation

### 💾 **Temporary Data Storage**
- In-memory storage for validated user data
- User data includes registration metadata
- RESTful API endpoints for data management
- User lookup by ID
- Bulk user retrieval
- User deletion functionality

## Installation & Setup

### Prerequisites
- Node.js (version 14.0.0 or higher)
- npm (comes with Node.js)

### Quick Start

1. **Clone or download the project files**

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Start the server**
   ```bash
   npm start
   ```

4. **Open your browser**
   Navigate to `http://localhost:3000`

### Development Mode

For development with auto-restart on file changes:
```bash
npm run dev
```

## API Endpoints

### Registration
- **POST** `/api/register` - Submit form data for validation and storage
- **GET** `/api/users` - Retrieve all registered users
- **GET** `/api/users/:id` - Get specific user by ID
- **DELETE** `/api/users/:id` - Delete user by ID
- **GET** `/api/health` - Server health check

### Example API Usage

#### Register a new user
```bash
curl -X POST http://localhost:3000/api/register \
  -H "Content-Type: application/json" \
  -d '{
    "firstName": "John",
    "lastName": "Doe",
    "email": "john@example.com",
    "phone": "1234567890",
    "dateOfBirth": "1990-01-01",
    "street": "123 Main St",
    "city": "Anytown",
    "state": "CA",
    "zipCode": "12345",
    "gender": "male",
    "interests": ["technology", "music"],
    "experience": "intermediate",
    "terms": true
  }'
```

#### Get all users
```bash
curl http://localhost:3000/api/users
```

## Form Validation Rules

### Client-Side Validation
- **Names**: Minimum 2 characters, letters only
- **Email**: Valid email format
- **Phone**: 10-15 digits, international format supported
- **Date of Birth**: Age between 13-120 years
- **ZIP Code**: Format 12345 or 12345-6789
- **Required Fields**: All marked with * are mandatory

### Server-Side Validation
- **Duplicate Email**: Prevents duplicate registrations
- **Data Sanitization**: Removes potentially dangerous characters
- **Age Verification**: Server-side age calculation
- **Format Validation**: Comprehensive format checking
- **Security**: XSS protection through input sanitization

## Project Structure

```
├── index.html          # Main HTML file with inline styles and JavaScript
├── server.js           # Express server with validation and storage
├── package.json        # Node.js dependencies and scripts
└── README.md           # This documentation
```

## Technologies Used

- **Frontend**: HTML5, CSS3, Vanilla JavaScript
- **Backend**: Node.js, Express.js
- **Validation**: Custom validation classes
- **Storage**: In-memory temporary storage
- **Styling**: Inline CSS with modern design patterns

## Features in Detail

### 🎯 **User Experience**
- Progressive form completion with visual progress bar
- Real-time validation feedback
- Smooth animations and transitions
- Responsive design for all devices
- Clear error messages and success indicators

### 🔐 **Security Features**
- Input sanitization to prevent XSS
- Server-side validation as security layer
- Data validation at multiple levels
- Safe handling of user input

### 📊 **Data Management**
- Temporary in-memory storage
- User metadata tracking
- Registration timestamp
- IP address logging
- User agent tracking

## Browser Support

- Chrome (recommended)
- Firefox
- Safari
- Edge
- Mobile browsers

## Development Notes

- The application uses in-memory storage, so data is lost when the server restarts
- For production use, consider implementing a database
- All validation is performed both client-side and server-side
- The server includes comprehensive error handling
- API endpoints follow RESTful conventions

## Troubleshooting

### Common Issues

1. **Port already in use**
   - Change the PORT in server.js or set environment variable
   - Use `PORT=3001 npm start`

2. **Dependencies not found**
   - Run `npm install` to install all dependencies

3. **Form not submitting**
   - Check browser console for JavaScript errors
   - Ensure server is running on correct port

## License

MIT License - feel free to use this project for learning and development purposes.
