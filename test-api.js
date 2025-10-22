// Simple API test script
// Run this after starting the server to test the API endpoints

const testData = {
    firstName: "John",
    lastName: "Doe",
    email: "john.doe@example.com",
    phone: "1234567890",
    dateOfBirth: "1990-01-01",
    street: "123 Main Street",
    city: "Anytown",
    state: "CA",
    zipCode: "12345",
    gender: "male",
    interests: ["technology", "music"],
    experience: "intermediate",
    bio: "Software developer with 5 years of experience",
    terms: true,
    newsletter: true
};

async function testAPI() {
    const baseURL = 'http://localhost:3000';
    
    try {
        console.log('🧪 Testing API endpoints...\n');
        
        // Test health check
        console.log('1. Testing health check...');
        const healthResponse = await fetch(`${baseURL}/api/health`);
        const healthData = await healthResponse.json();
        console.log('✅ Health check:', healthData.message);
        console.log('📊 Total users:', healthData.totalUsers);
        console.log('');
        
        // Test registration
        console.log('2. Testing user registration...');
        const registerResponse = await fetch(`${baseURL}/api/register`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(testData)
        });
        
        const registerData = await registerResponse.json();
        
        if (registerData.success) {
            console.log('✅ Registration successful!');
            console.log('👤 User ID:', registerData.userId);
            console.log('📧 Email:', registerData.data.email);
            console.log('📅 Registration Date:', registerData.data.registrationDate);
        } else {
            console.log('❌ Registration failed:', registerData.message);
            if (registerData.errors) {
                console.log('Errors:', registerData.errors);
            }
        }
        console.log('');
        
        // Test getting all users
        console.log('3. Testing get all users...');
        const usersResponse = await fetch(`${baseURL}/api/users`);
        const usersData = await usersResponse.json();
        
        if (usersData.success) {
            console.log('✅ Retrieved users successfully!');
            console.log('👥 Total users:', usersData.count);
            console.log('📋 Users:', usersData.users.map(u => `${u.firstName} ${u.lastName} (${u.email})`));
        } else {
            console.log('❌ Failed to retrieve users:', usersData.message);
        }
        console.log('');
        
        // Test getting specific user
        if (registerData.success && registerData.userId) {
            console.log('4. Testing get specific user...');
            const userResponse = await fetch(`${baseURL}/api/users/${registerData.userId}`);
            const userData = await userResponse.json();
            
            if (userData.success) {
                console.log('✅ Retrieved user successfully!');
                console.log('👤 User details:', {
                    name: `${userData.user.firstName} ${userData.user.lastName}`,
                    email: userData.user.email,
                    city: userData.user.city,
                    experience: userData.user.experience,
                    interests: userData.user.interests
                });
            } else {
                console.log('❌ Failed to retrieve user:', userData.message);
            }
            console.log('');
        }
        
        console.log('🎉 API testing completed!');
        
    } catch (error) {
        console.error('❌ Test failed:', error.message);
        console.log('💡 Make sure the server is running on http://localhost:3000');
    }
}

// Run the test
testAPI();
