import { createFileRoute, Outlet } from "@tanstack/react-router";

export const Route = createFileRoute("/trips")({
  component: TripsLayout,
});

function TripsLayout() {
  return <Outlet />;
}
