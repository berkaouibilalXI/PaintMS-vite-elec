export const StatCard = ({ title, value, icon, loading }) => (
  <div className="bg-card border border-border rounded-lg p-6 shadow-sm hover:shadow-md transition-all duration-200 hover:scale-[1.02]">
    <div className="flex items-center justify-between">
      <div>
        <p className="text-sm font-medium text-muted-foreground mb-1">{title}</p>
        {/* Changed from <p> to <div> to avoid nesting block element inside <p> */}
        <div className="text-2xl font-bold text-card-foreground">
          {loading ? (
            <div className="h-8 w-16 bg-muted animate-pulse rounded"></div>
          ) : (
            value
          )}
        </div>
      </div>
      <div className="p-3 bg-primary/10 rounded-full">
        {icon}
      </div>
    </div>
  </div>
);