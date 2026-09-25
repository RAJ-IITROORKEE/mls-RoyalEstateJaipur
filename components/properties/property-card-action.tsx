import { ArrowUpRight } from "lucide-react";

export function PropertyCardAction() {
  return (
    <div className="mt-5 border-t border-border pt-4">
      <span className="property-card-cta">
        <span>View property</span>
        <span aria-hidden="true" className="property-card-cta__icon">
          <ArrowUpRight className="size-4" />
        </span>
      </span>
    </div>
  );
}
