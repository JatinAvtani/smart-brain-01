import { ShareIcon } from "../icons/ShareIcon";
import { Linknew } from "../icons/Linknew";


interface CardProps {
    title: string;
    link: string;
    type: "twitter" | "youtube";
}

export function Card({title, link, type}: CardProps) {
    return <div>
        <div className="p-4 bg-white rounded-md border-gray-200 max-w-72  border min-h-48 min-w-72">
            <div className="flex justify-between">
                <div className="flex items-center text-md">
                    <div className="text-gray-500 pr-2">
                        <ShareIcon />
                    </div>
                    {title}
                </div>
                <div className="flex items-center">
                    <div className="pr-2 text-gray-500">
                        <a href={link} target="_blank">
                            <Linknew/>
                        </a>
                    </div>
                    <div className="text-gray-500">
                        <ShareIcon />
                    </div>
                </div>
            </div>

            <div className="pt-4">
                {type === "youtube" && (() => {
    try {
        const videoId = (() => {
            const urlObj = new URL(link);
            if (urlObj.hostname === "youtu.be") {
                return urlObj.pathname.substring(1); // remove the leading "/"
            }
            if (urlObj.hostname.includes("youtube.com")) {
                return urlObj.searchParams.get("v");
            }
            return null;
        })();

        if (!videoId) return null;
        const embedURL = `https://www.youtube.com/embed/${videoId}`;

        return (
            <iframe
                className="w-full"
                src={embedURL}
                title="YouTube video player"
                frameBorder="0"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                referrerPolicy="strict-origin-when-cross-origin"
                allowFullScreen
            />
        );
    } catch (e) {
        return null;
    }
})()}

                {type === "twitter" && <blockquote className="twitter-tweet">
                    <a href={link.replace("x.com", "twitter.com")}></a> 
                </blockquote>}
            </div>

        </div>
    </div>
}