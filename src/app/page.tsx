import { Sidebar } from "@/components/Sidebar";
import RootLayout from "./layout";
import { Chat } from "@/components/Chat";

export default function Home() {
  return (
    <RootLayout>
      <div className="size-full">
        <Chat />
      </div>
    </RootLayout>
  );
}
