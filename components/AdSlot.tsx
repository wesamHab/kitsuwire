type AdSlotProps = {
  position: "in-article" | "end-article";
};

export function AdSlot({ position }: AdSlotProps) {
  return (
    <div className={`ad-slot ad-slot-${position}`} aria-label="Advertisement">
      <span>ADVERTISEMENT</span>
      <div className="ad-slot-placeholder">Ad space reserved for KitsuWire articles</div>
    </div>
  );
}
