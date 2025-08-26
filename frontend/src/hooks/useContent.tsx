import axios from "axios";
import { useEffect, useState } from "react";
import { BACKEND_URL } from "../config";

export function useContent() {
    const [contents, setContents] = useState([]);

    function refresh() {
        const token = localStorage.getItem("token");
        if (!token) {
            console.log("No token found, skipping content fetch");
            return;
        }
        
        axios.get(`${BACKEND_URL}/api/v1/content`, {
            headers: {
                "Authorization": token
            }
        })
            .then((response) => {
                setContents(response.data.content)
            })
            .catch((error) => {
                console.error("Error fetching content:", error);
                if (error.response?.status === 403) {
                    // Token is invalid, redirect to signin
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