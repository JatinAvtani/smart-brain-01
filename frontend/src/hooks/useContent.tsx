import axios from "axios";
import { useEffect, useState } from "react";
import { BACKEND_URL } from "../config";

export function useContent() {
    const [contents, setContents] = useState([]);

    function refresh() {
        const token = localStorage.getItem("token");
        console.log("useContent refresh called, token:", token ? "exists" : "missing");
        
        if (!token) {
            console.log("No token found, skipping content fetch");
            return;
        }
        
        console.log("Making request to:", `${BACKEND_URL}/api/v1/content`);
        console.log("With token:", token.substring(0, 20) + "...");
        
        axios.get(`${BACKEND_URL}/api/v1/content`, {
            headers: {
                "Authorization": token
            }
        })
            .then((response) => {
                console.log("Content fetch successful:", response.data);
                setContents(response.data.content)
            })
            .catch((error) => {
                console.error("Error fetching content:", error);
                console.error("Error response:", error.response?.data);
                console.error("Error status:", error.response?.status);
                if (error.response?.status === 403) {
                    console.log("403 error - redirecting to signin");
                    localStorage.removeItem("token");
                    window.location.href = "/signin";
                }
            })
    }

    useEffect(() => {
        refresh()
        let interval = setInterval(() => {
            refresh()
        }, 10 * 1000)

        return () => {
            clearInterval(interval);
        }
    }, [])

    return {contents, refresh};
}