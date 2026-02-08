interface SkeletonProps {
  className?: string;
  variant?: 'text' | 'circular' | 'rectangular';
  width?: string | number;
  height?: string | number;
  lines?: number;
}

export function Skeleton({
  className = '',
  variant = 'text',
  width,
  height,
  lines = 1,
}: SkeletonProps) {
  const baseClass = 'shimmer rounded';

  const variantClasses = {
    text: 'h-4 rounded',
    circular: 'rounded-full',
    rectangular: 'rounded-lg',
  };

  const style: React.CSSProperties = {
    width: width ?? (variant === 'text' ? '100%' : undefined),
    height: height ?? (variant === 'circular' ? width : undefined),
  };

  if (lines > 1 && variant === 'text') {
    return (
      <div className={`space-y-2 ${className}`}>
        {Array.from({ length: lines }).map((_, i) => (
          <div
            key={i}
            className={`${baseClass} ${variantClasses[variant]}`}
            style={{ ...style, width: i === lines - 1 ? '75%' : '100%' }}
          />
        ))}
      </div>
    );
  }

  return (
    <div
      className={`${baseClass} ${variantClasses[variant]} ${className}`}
      style={style}
    />
  );
}

// Pre-built skeleton patterns
export function SkeletonCard() {
  return (
    <div className="rounded-lg border border-sage/20 bg-white p-4 space-y-3">
      <div className="flex items-start gap-3">
        <Skeleton variant="rectangular" width={40} height={40} />
        <div className="flex-1 space-y-2">
          <Skeleton variant="text" width="70%" height={16} />
          <Skeleton variant="text" width="50%" height={12} />
        </div>
      </div>
      <div className="flex items-center justify-between pt-2">
        <div className="flex gap-1">
          <Skeleton variant="rectangular" width={16} height={16} />
          <Skeleton variant="rectangular" width={16} height={16} />
          <Skeleton variant="rectangular" width={16} height={16} />
        </div>
        <Skeleton variant="text" width={30} height={12} />
      </div>
    </div>
  );
}

export function SkeletonRow() {
  return (
    <div className="flex items-center gap-4 px-4 py-3 border-b border-sage/10">
      <Skeleton variant="rectangular" width={36} height={36} className="rounded-md" />
      <div className="flex-1 space-y-1.5">
        <Skeleton variant="text" width="40%" height={14} />
        <Skeleton variant="text" width="25%" height={12} />
      </div>
      <Skeleton variant="text" width={80} height={12} />
      <Skeleton variant="rectangular" width={70} height={22} className="rounded-full" />
      <Skeleton variant="text" width={60} height={16} />
      <Skeleton variant="text" width={30} height={12} />
    </div>
  );
}

export function SkeletonDetailPanel() {
  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="space-y-3">
        <Skeleton variant="text" width="60%" height={24} />
        <Skeleton variant="text" width="40%" height={16} />
      </div>

      {/* Tabs */}
      <div className="flex gap-4 border-b border-sage/20 pb-2">
        <Skeleton variant="text" width={60} height={14} />
        <Skeleton variant="text" width={70} height={14} />
        <Skeleton variant="text" width={80} height={14} />
      </div>

      {/* Content */}
      <div className="space-y-4">
        <div className="space-y-2">
          <Skeleton variant="text" width={80} height={12} />
          <Skeleton variant="rectangular" width="100%" height={36} />
        </div>
        <div className="space-y-2">
          <Skeleton variant="text" width={60} height={12} />
          <Skeleton variant="rectangular" width="100%" height={36} />
        </div>
        <div className="space-y-2">
          <Skeleton variant="text" width={50} height={12} />
          <Skeleton variant="rectangular" width="100%" height={80} />
        </div>
      </div>
    </div>
  );
}

export function SkeletonKanbanColumn() {
  return (
    <div className="flex flex-col h-full">
      {/* Column header */}
      <div className="flex items-center justify-between p-3 border-b border-sage/20">
        <div className="flex items-center gap-2">
          <Skeleton variant="circular" width={10} height={10} />
          <Skeleton variant="text" width={80} height={14} />
        </div>
        <Skeleton variant="rectangular" width={24} height={20} className="rounded-full" />
      </div>

      {/* Cards */}
      <div className="flex-1 p-2 space-y-2 overflow-hidden">
        <SkeletonCard />
        <SkeletonCard />
        <SkeletonCard />
      </div>
    </div>
  );
}
