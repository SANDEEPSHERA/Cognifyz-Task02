const express = require('express');
const cors = require('cors');
const path = require('path');

const app = express();
const DEFAULT_PORT = parseInt(process.env.PORT, 10) || 3000;

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.static('.'));

// In-memory storage for validated data
const validatedData = [];
let nextId = 1;

// Validation functions
class ServerValidator {
    static validateName(name, fieldName) {
        if (!name || typeof name !== 'string') {
            return { isValid: false, message: `${fieldName} is required.` };
        }
        
        const trimmedName = name.trim();
        if (trimmedName.length < 2) {
            return { isValid: false, message: `${fieldName} must be at least 2 characters long.` };
        }
        
        if (!/^[a-zA-Z\s]+$/.test(trimmedName)) {
            return { isValid: false, message: `${fieldName} must contain only letters and spaces.` };
        }
        
        return { isValid: true };
    }

    static validateEmail(email) {
        if (!email || typeof email !== 'string') {
            return { isValid: false, message: 'Email is required.' };
        }
        
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(email)) {
            return { isValid: false, message: 'Please provide a valid email address.' };
        }
        
        // Check for duplicate email
        const existingUser = validatedData.find(user => user.email === email);
        if (existingUser) {
            return { isValid: false, message: 'This email address is already registered.' };
        }
        
        return { isValid: true };
    }

    static validatePhone(phone) {
        if (!phone || typeof phone !== 'string') {
            return { isValid: false, message: 'Phone number is required.' };
        }
        
        // Remove all non-digit characters except +
        const cleanPhone = phone.replace(/[^\d+]/g, '');
        
        if (cleanPhone.length < 10 || cleanPhone.length > 15) {
            return { isValid: false, message: 'Phone number must be between 10 and 15 digits.' };
        }
        
        if (!/^[\+]?[1-9][\d]{0,15}$/.test(cleanPhone)) {
            return { isValid: false, message: 'Please provide a valid phone number.' };
        }
        
        return { isValid: true };
    }

    static validateDateOfBirth(dateOfBirth) {
        if (!dateOfBirth) {
            return { isValid: false, message: 'Date of birth is required.' };
        }
        
        const birthDate = new Date(dateOfBirth);
        const today = new Date();
        
        if (isNaN(birthDate.getTime())) {
            return { isValid: false, message: 'Please provide a valid date of birth.' };
        }
        
        if (birthDate > today) {
            return { isValid: false, message: 'Date of birth cannot be in the future.' };
        }
        
        const age = today.getFullYear() - birthDate.getFullYear();
        const monthDiff = today.getMonth() - birthDate.getMonth();
        
        if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
            age--;
        }
        
        if (age < 13) {
            return { isValid: false, message: 'You must be at least 13 years old to register.' };
        }
        
        if (age > 120) {
            return { isValid: false, message: 'Please provide a valid date of birth.' };
        }
        
        return { isValid: true };
    }

    static validateAddress(street, city, state, zipCode) {
        const errors = [];
        
        if (!street || typeof street !== 'string' || street.trim().length < 5) {
            errors.push('Street address must be at least 5 characters long.');
        }
        
        if (!city || typeof city !== 'string' || city.trim().length < 2) {
            errors.push('City must be at least 2 characters long.');
        }
        
        if (!state || typeof state !== 'string' || state.trim().length === 0) {
            errors.push('State/Province is required.');
        }
        
        if (!zipCode || typeof zipCode !== 'string') {
            errors.push('PIN code is required.');
        } else {
            const pinRegex = /^[1-9][0-9]{5}$/; // Indian 6-digit PIN code
            if (!pinRegex.test(zipCode.trim())) {
                errors.push('PIN code must be a valid 6-digit number.');
            }
        }
        
        return {
            isValid: errors.length === 0,
            message: errors.length > 0 ? errors.join(' ') : null
        };
    }

    static validateGender(gender) {
        const validGenders = ['male', 'female', 'other'];
        if (!gender || !validGenders.includes(gender)) {
            return { isValid: false, message: 'Please select a valid gender option.' };
        }
        return { isValid: true };
    }

    static validateExperience(experience) {
        const validExperiences = ['beginner', 'intermediate', 'advanced', 'expert'];
        if (!experience || !validExperiences.includes(experience)) {
            return { isValid: false, message: 'Please select a valid experience level.' };
        }
        return { isValid: true };
    }

    static validateInterests(interests) {
        if (!Array.isArray(interests)) {
            return { isValid: true }; // Interests are optional
        }
        
        const validInterests = ['technology', 'sports', 'music', 'travel', 'reading'];
        const invalidInterests = interests.filter(interest => !validInterests.includes(interest));
        
        if (invalidInterests.length > 0) {
            return { 
                isValid: false, 
                message: `Invalid interests: ${invalidInterests.join(', ')}` 
            };
        }
        
        return { isValid: true };
    }

    static validateTerms(terms) {
        if (!terms) {
            return { isValid: false, message: 'You must agree to the terms and conditions.' };
        }
        return { isValid: true };
    }

    static validateBio(bio) {
        if (bio && typeof bio === 'string' && bio.length > 1000) {
            return { isValid: false, message: 'Bio must be less than 1000 characters.' };
        }
        return { isValid: true };
    }

    static validateAll(data) {
        const errors = [];
        
        // Validate required fields
        const firstNameValidation = this.validateName(data.firstName, 'First name');
        if (!firstNameValidation.isValid) errors.push(firstNameValidation.message);
        
        const lastNameValidation = this.validateName(data.lastName, 'Last name');
        if (!lastNameValidation.isValid) errors.push(lastNameValidation.message);
        
        const emailValidation = this.validateEmail(data.email);
        if (!emailValidation.isValid) errors.push(emailValidation.message);
        
        const phoneValidation = this.validatePhone(data.phone);
        if (!phoneValidation.isValid) errors.push(phoneValidation.message);
        
        const dobValidation = this.validateDateOfBirth(data.dateOfBirth);
        if (!dobValidation.isValid) errors.push(dobValidation.message);
        
        const addressValidation = this.validateAddress(data.street, data.city, data.state, data.zipCode);
        if (!addressValidation.isValid) errors.push(addressValidation.message);
        
        const genderValidation = this.validateGender(data.gender);
        if (!genderValidation.isValid) errors.push(genderValidation.message);
        
        const experienceValidation = this.validateExperience(data.experience);
        if (!experienceValidation.isValid) errors.push(experienceValidation.message);
        
        const termsValidation = this.validateTerms(data.terms);
        if (!termsValidation.isValid) errors.push(termsValidation.message);
        
        // Validate optional fields
        const interestsValidation = this.validateInterests(data.interests);
        if (!interestsValidation.isValid) errors.push(interestsValidation.message);
        
        const bioValidation = this.validateBio(data.bio);
        if (!bioValidation.isValid) errors.push(bioValidation.message);
        
        return {
            isValid: errors.length === 0,
            errors: errors
        };
    }
}

// Sanitize data function
function sanitizeData(data) {
    const sanitized = {};
    
    for (const [key, value] of Object.entries(data)) {
        if (typeof value === 'string') {
            // Remove potentially dangerous characters and trim whitespace
            sanitized[key] = value.trim().replace(/[<>]/g, '');
        } else if (Array.isArray(value)) {
            // Sanitize array elements
            sanitized[key] = value.map(item => 
                typeof item === 'string' ? item.trim().replace(/[<>]/g, '') : item
            );
        } else {
            sanitized[key] = value;
        }
    }
    
    return sanitized;
}

// Routes
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'index.html'));
});

// Registration endpoint
app.post('/api/register', (req, res) => {
    try {
        console.log('Received registration data:', req.body);
        
        // Sanitize input data
        const sanitizedData = sanitizeData(req.body);
        
        // Validate all fields
        const validation = ServerValidator.validateAll(sanitizedData);
        
        if (!validation.isValid) {
            return res.status(400).json({
                success: false,
                message: 'Validation failed',
                errors: validation.errors
            });
        }
        
        // Create user object with additional metadata
        const userData = {
            id: nextId++,
            ...sanitizedData,
            registrationDate: new Date().toISOString(),
            ipAddress: req.ip || req.connection.remoteAddress,
            userAgent: req.get('User-Agent')
        };
        
        // Store validated data
        validatedData.push(userData);
        
        console.log('User registered successfully:', userData.id);
        
        res.json({
            success: true,
            message: 'Registration successful',
            userId: userData.id,
            data: {
                firstName: userData.firstName,
                lastName: userData.lastName,
                email: userData.email,
                registrationDate: userData.registrationDate
            }
        });
        
    } catch (error) {
        console.error('Registration error:', error);
        res.status(500).json({
            success: false,
            message: 'Internal server error',
            error: process.env.NODE_ENV === 'development' ? error.message : 'Something went wrong'
        });
    }
});

// Get all registered users (for admin purposes)
app.get('/api/users', (req, res) => {
    try {
        // Return sanitized user data (without sensitive info)
        const publicUserData = validatedData.map(user => ({
            id: user.id,
            firstName: user.firstName,
            lastName: user.lastName,
            email: user.email,
            city: user.city,
            state: user.state,
            experience: user.experience,
            interests: user.interests,
            registrationDate: user.registrationDate
        }));
        
        res.json({
            success: true,
            count: publicUserData.length,
            users: publicUserData
        });
    } catch (error) {
        console.error('Error fetching users:', error);
        res.status(500).json({
            success: false,
            message: 'Error fetching user data'
        });
    }
});

// Get specific user by ID
app.get('/api/users/:id', (req, res) => {
    try {
        const userId = parseInt(req.params.id);
        const user = validatedData.find(u => u.id === userId);
        
        if (!user) {
            return res.status(404).json({
                success: false,
                message: 'User not found'
            });
        }
        
        // Return sanitized user data
        const publicUserData = {
            id: user.id,
            firstName: user.firstName,
            lastName: user.lastName,
            email: user.email,
            phone: user.phone,
            dateOfBirth: user.dateOfBirth,
            street: user.street,
            city: user.city,
            state: user.state,
            zipCode: user.zipCode,
            gender: user.gender,
            interests: user.interests,
            experience: user.experience,
            bio: user.bio,
            newsletter: user.newsletter,
            registrationDate: user.registrationDate
        };
        
        res.json({
            success: true,
            user: publicUserData
        });
    } catch (error) {
        console.error('Error fetching user:', error);
        res.status(500).json({
            success: false,
            message: 'Error fetching user data'
        });
    }
});

// Delete user by ID
app.delete('/api/users/:id', (req, res) => {
    try {
        const userId = parseInt(req.params.id);
        const userIndex = validatedData.findIndex(u => u.id === userId);
        
        if (userIndex === -1) {
            return res.status(404).json({
                success: false,
                message: 'User not found'
            });
        }
        
        const deletedUser = validatedData.splice(userIndex, 1)[0];
        
        res.json({
            success: true,
            message: 'User deleted successfully',
            deletedUser: {
                id: deletedUser.id,
                firstName: deletedUser.firstName,
                lastName: deletedUser.lastName,
                email: deletedUser.email
            }
        });
    } catch (error) {
        console.error('Error deleting user:', error);
        res.status(500).json({
            success: false,
            message: 'Error deleting user'
        });
    }
});

// Health check endpoint
app.get('/api/health', (req, res) => {
    res.json({
        success: true,
        message: 'Server is running',
        timestamp: new Date().toISOString(),
        totalUsers: validatedData.length
    });
});

// Error handling middleware
app.use((err, req, res, next) => {
    console.error('Unhandled error:', err);
    res.status(500).json({
        success: false,
        message: 'Internal server error'
    });
});

// 404 handler
app.use((req, res) => {
    res.status(404).json({
        success: false,
        message: 'Endpoint not found'
    });
});

// Start server with automatic port fallback if the port is already in use
function startServer(port, attemptsLeft = 5) {
    const server = app.listen(port, () => {
        const actualPort = server.address().port;
        console.log(`🚀 Server running on http://localhost:${actualPort}`);
        console.log(`📊 Health check: http://localhost:${actualPort}/api/health`);
        console.log(`👥 Users endpoint: http://localhost:${actualPort}/api/users`);
        console.log(`📝 Registration endpoint: http://localhost:${actualPort}/api/register`);
    });

    server.on('error', (err) => {
        if (err && err.code === 'EADDRINUSE' && attemptsLeft > 0) {
            const nextPort = port + 1;
            console.warn(`⚠️  Port ${port} is in use. Trying ${nextPort}... (${attemptsLeft - 1} more attempts)`);
            // Small delay before retrying to avoid rapid loops
            setTimeout(() => startServer(nextPort, attemptsLeft - 1), 250);
        } else if (err && err.code === 'EADDRINUSE') {
            console.error(`❌ All retry attempts exhausted. Please set a free PORT env variable and restart.`);
        } else {
            console.error('Unhandled server error:', err);
        }
    });
}

startServer(DEFAULT_PORT);

// Graceful shutdown
process.on('SIGINT', () => {
    console.log('\n🛑 Shutting down server...');
    console.log(`📊 Total users registered: ${validatedData.length}`);
    process.exit(0);
});

module.exports = app;
