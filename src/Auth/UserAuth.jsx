import React, { useContext, useEffect, useState } from 'react';
import { UserContext } from '../contex/user.contex';
import { useNavigate } from 'react-router-dom';
import axiosInstance from '../Config/axios';

const UserAuth = ({ children }) => {
    const { user, setUser } = useContext(UserContext);
    const [loading, setLoading] = useState(true);
    const navigate = useNavigate();

    useEffect(() => {
        const token = localStorage.getItem('token');
        if (!token) {
            console.warn("No token found in localStorage. Redirecting to login.");
            navigate('/login');
            return;
        }

        if (!user) {
            axiosInstance
                .get('/auth/me')
                .then((response) => {
                    console.log("Fetched user data:", response.data);
                    setUser(response.data);
                })
                .catch((error) => {
                    console.error("Failed to fetch user:", error);
                    localStorage.removeItem('token');
                    navigate('/login');
                })
                .finally(() => setLoading(false));
        } else {
            setLoading(false);
        }
    }, [navigate, setUser, user]);

    if (loading) {
        return <div className="flex justify-center items-center h-screen">Loading...</div>;
    }

    return <>{children}</>;
};

export default UserAuth;
