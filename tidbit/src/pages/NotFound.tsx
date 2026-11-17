import { Link } from "react-router";
import { Compass } from "lucide-react";
import { Button, EmptyState } from "../components/ui";

export default function NotFound() {
  return (
    <EmptyState
      icon={<Compass />}
      title="This page doesn't exist"
      body="The link may be broken, or the story may have been removed."
      action={<Link to="/"><Button>Back to your feed</Button></Link>}
    />
  );
}
