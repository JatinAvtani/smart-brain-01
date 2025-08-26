import { useEffect, useState } from "react"
import { Button } from "../components/Button"
import { Card } from "../components/Card"
import { CreateContentModal } from "../components/CreateContentModal"
import { PlusIcon } from "../icons/PlusIcon"
import { ShareIcon } from "../icons/ShareIcon"
import { Sidebar } from "../components/Sidebar"
import { useContent } from "../hooks/useContent"
import { BACKEND_URL } from "../config"
import axios from "axios"

export function Dashboard() {
  const [modalOpen, setModalOpen] = useState(false);
  const {contents, refresh} = useContent();

  // Check authentication on component mount
  useEffect(() => {
    const token = localStorage.getItem("token");
    console.log("Dashboard mounted, token:", token ? "exists" : "missing");
    if (!token) {
      console.log("No token found, redirecting to signin");
      window.location.href = "/signin";
      return;
    }
    console.log("Token found, proceeding to dashboard");
  }, []);

  useEffect(() => {
    refresh();
  }, [modalOpen])

  return <div>
    <Sidebar />
    <div className="p-4 ml-72 min-h-screen bg-gray-100 border-2">
      <CreateContentModal open={modalOpen} onClose={() => {
        setModalOpen(false);
      }} />
      <div className="flex justify-end gap-4">
        <Button onClick={() => {
          setModalOpen(true)
        }} variant="primary" text="Add content" startIcon={<PlusIcon />}></Button>
        <Button onClick={async () => {
            const response = await axios.post(`${BACKEND_URL}/api/v1/brain/share`, {
                share: true
            }, {
                headers: {
                    "Authorization": localStorage.getItem("token")
                }
            });
            const shareUrl = `${window.location.origin}/share/${response.data.hash}`;
            alert(shareUrl);
        }} variant="secondary" text="Share brain" startIcon={<ShareIcon />}></Button>
      </div>

      <div className="flex gap-4 flex-wrap">
        {contents.map(({type, link, title}) => <Card 
            type={type}
            link={link}
            title={title}
        />)}
      </div>
    </div>
  </div>
}

