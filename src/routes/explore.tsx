import { createFileRoute, Outlet } from "@tanstack/react-router";

export const Route = createFileRoute("/explore")({
  component: ExploreLayout,
});

function ExploreLayout() {
  return <Outlet />;
}
