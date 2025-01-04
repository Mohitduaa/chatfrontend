import React, { useContext, useEffect, useState } from 'react';
import { UserContext } from '../contex/user.contex';
import { useNavigate } from 'react-router-dom';
import axios from '../Config/axios';

const UserAuth = ({ children }) => {
    const { user, setUser } = useContext(UserContext);
    const [loading, setLoading] = useState(true);
    const navigate = useNavigate();

    useEffect(() => {
        const token = localStorage.getItem('token');
        
        // If no token found, navigate to login
        if (!token) {
            console.log("No token found in localStorage");
            navigate('/login');
            return;
        }

        // If user is already in context, no need to fetch again
        if (user) {
            setLoading(false);
            return;
        }

        // Fetch user data if token exists but user is not set in context
        axios
            .get('/auth/me', {
                headers: {
                    Authorization: `Bearer ${token}`, // Send token in headers for authentication
                },
            })
            .then((response) => {
                console.log("User data from /auth/me:", response.data);
                setUser(response.data); // Set user data in context
            })
            .catch((error) => {
                console.error("Error in /auth/me request:", error);
                localStorage.removeItem('token');
                navigate('/login');
            })
            .finally(() => setLoading(false)); // Ensure loading is set to false after request
    }, [navigate, setUser, user]);

    if (loading) {
        return <div className="flex justify-center items-center h-screen">Loading...</div>;
    }

    return <>{children}</>;
};

export default UserAuth;
