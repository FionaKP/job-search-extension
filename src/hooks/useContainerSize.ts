import { useState, useEffect, useCallback, RefObject } from 'react';

interface ContainerSize {
  width: number;
  height: number;
}

/**
 * Hook to measure and track the size of a container element
 * Used for virtualized lists that need explicit dimensions
 */
export function useContainerSize(containerRef: RefObject<HTMLElement>): ContainerSize {
  const [size, setSize] = useState<ContainerSize>({ width: 0, height: 0 });

  const updateSize = useCallback(() => {
    if (containerRef.current) {
      const { clientWidth, clientHeight } = containerRef.current;
      setSize(prevSize => {
        if (prevSize.width !== clientWidth || prevSize.height !== clientHeight) {
          return { width: clientWidth, height: clientHeight };
        }
        return prevSize;
      });
    }
  }, [containerRef]);

  useEffect(() => {
    updateSize();

    // Use ResizeObserver for efficient resize tracking
    const resizeObserver = new ResizeObserver(() => {
      // Debounce resize updates
      requestAnimationFrame(updateSize);
    });

    if (containerRef.current) {
      resizeObserver.observe(containerRef.current);
    }

    return () => {
      resizeObserver.disconnect();
    };
  }, [containerRef, updateSize]);

  return size;
}

export default useContainerSize;
