import Nav from "@/components/Nav";

export default function AppLayout({ children }: { children: React.ReactNode }) {
  return (
    <div>
      <Nav />
      {children}
    </div>
  );
}
