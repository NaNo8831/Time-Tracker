import Nav from "@/components/Nav";

// Every signed-in page reads live data from the database (and "today"), so none
// of them may be pre-rendered at build time. Previously this happened as a side
// effect of the Supabase client reading cookies; it is now explicit.
export const dynamic = "force-dynamic";

export default function AppLayout({ children }: { children: React.ReactNode }) {
  return (
    <div>
      <Nav />
      {children}
    </div>
  );
}
