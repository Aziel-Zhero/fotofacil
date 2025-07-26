
"use client";

import {
  useEffect,
  useLayoutEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import { gsap } from "gsap";

import "./masonry-gallery.css";

const useMedia = (
  queries: string[],
  values: number[],
  defaultValue: number
) => {
    const [value, setValue] = useState(defaultValue);

    useEffect(() => {
        if (typeof window === 'undefined') {
            setValue(defaultValue);
            return;
        }
        
        const get = () =>
            values[queries.findIndex((q) => matchMedia(q).matches)] ?? defaultValue;

        const handler = () => setValue(get);
        
        handler();

        const mqls = queries.map(q => matchMedia(q));
        mqls.forEach((mql) => mql.addEventListener("change", handler));
        
        return () => mqls.forEach((mql) => mql.removeEventListener("change", handler));
    }, [queries, values, defaultValue]);

    return value;
};

const useMeasure = (): [React.RefObject<HTMLDivElement>, { width: number, height: number }] => {
  const ref = useRef<HTMLDivElement>(null);
  const [size, setSize] = useState({ width: 0, height: 0 });

  useLayoutEffect(() => {
    if (!ref.current) return;
    const ro = new ResizeObserver(([entry]) => {
      const { width, height } = entry.contentRect;
      setSize({ width, height });
    });
    ro.observe(ref.current);
    return () => ro.disconnect();
  }, []);

  return [ref, size];
};

const preloadImages = async (urls: string[]) => {
  await Promise.all(
    urls.map(
      (src) =>
        new Promise((resolve) => {
          const img = new Image();
          img.src = src;
          img.onload = img.onerror = () => resolve(img);
        })
    )
  );
};

interface MasonryItem {
    id: string;
    img: string;
    dataAiHint?: string;
    height: number;
    url?: string;
}

interface MasonryGalleryProps {
  items: MasonryItem[];
  ease?: string;
  duration?: number;
  stagger?: number;
  animateFrom?: "top" | "bottom" | "left" | "right" | "center" | "random";
  scaleOnHover?: boolean;
  hoverScale?: number;
  blurToFocus?: boolean;
  colorShiftOnHover?: boolean;
  gap?: number;
};

export const MasonryGallery = ({
  items,
  ease = "power3.out",
  duration = 0.6,
  stagger = 0.05,
  animateFrom = "bottom",
  scaleOnHover = true,
  hoverScale = 0.95,
  blurToFocus = true,
  colorShiftOnHover = false,
  gap = 16,
}: MasonryGalleryProps) => {
  const columns = useMedia(
    [
      "(min-width:1500px)",
      "(min-width:1000px)",
      "(min-width:600px)",
      "(min-width:400px)",
    ],
    [5, 4, 3, 2],
    1
  );

  const [containerRef, { width, height }] = useMeasure();
  const [imagesReady, setImagesReady] = useState(false);

  const getInitialPosition = (item: any) => {
    if (typeof window === 'undefined') return { x: 0, y: 0 };
    const containerRect = containerRef.current?.getBoundingClientRect();
    if (!containerRect) return { x: item.x, y: item.y };

    let direction = animateFrom;

    if (animateFrom === "random") {
      const directions = ["top", "bottom", "left", "right"];
      direction = directions[
        Math.floor(Math.random() * directions.length)
      ] as any;
    }

    switch (direction) {
      case "top":
        return { x: item.x, y: -200 };
      case "bottom":
        return { x: item.x, y: window.innerHeight + 200 };
      case "left":
        return { x: -200, y: item.y };
      case "right":
        return { x: window.innerWidth + 200, y: item.y };
      case "center":
        return {
          x: containerRect.width / 2 - item.w / 2,
          y: containerRect.height / 2 - item.h / 2,
        };
      default:
        return { x: item.x, y: item.y + 100 };
    }
  };

  useEffect(() => {
    preloadImages(items.map((i) => i.img)).then(() => setImagesReady(true));
  }, [items]);

  const grid = useMemo(() => {
    if (!width) return { gridItems: [], containerHeight: 0 };

    let colHeights = new Array(columns).fill(0);
    let columnWidth = (width - (columns - 1) * gap) / columns;
    let gridItems = items.map((child) => {
      const col = colHeights.indexOf(Math.min(...colHeights));
      const x = col * (columnWidth + gap);
      const scaledHeight = (child.height * columnWidth) / 600; 
      const y = colHeights[col];

      colHeights[col] += scaledHeight + gap;

      return { ...child, x, y, w: columnWidth, h: scaledHeight };
    });

    const containerHeight = Math.max(...colHeights) - gap;
    return { gridItems, containerHeight };

  }, [columns, items, width, gap]);

  const hasMounted = useRef(false);

  useLayoutEffect(() => {
    if (!imagesReady || !width) return;

    grid.gridItems.forEach((item, index) => {
      const selector = `[data-key="${item.id}"]`;
      const animationProps = {
        x: item.x,
        y: item.y,
        width: item.w,
        height: item.h,
      };

      if (!hasMounted.current) {
        const initialPos = getInitialPosition(item);
        const initialState = {
          opacity: 0,
          x: initialPos.x,
          y: initialPos.y,
          width: item.w,
          height: item.h,
          ...(blurToFocus && { filter: "blur(10px)" }),
        };

        gsap.fromTo(selector, initialState, {
          opacity: 1,
          ...animationProps,
          ...(blurToFocus && { filter: "blur(0px)" }),
          duration: 0.8,
          ease: "power3.out",
          delay: index * stagger,
        });
      } else {
        gsap.to(selector, {
          ...animationProps,
          duration: duration,
          ease: ease,
          overwrite: "auto",
        });
      }
    });

    if(!hasMounted.current) {
        hasMounted.current = true;
    }
  }, [grid.gridItems, imagesReady, stagger, animateFrom, blurToFocus, duration, ease, width]);

  const handleMouseEnter = (e: React.MouseEvent<HTMLDivElement, MouseEvent>, item: any) => {
    const selector = `[data-key="${item.id}"]`;

    if (scaleOnHover) {
      gsap.to(selector, {
        scale: hoverScale,
        duration: 0.3,
        ease: "power2.out"
      });
    }

    if (colorShiftOnHover) {
      const overlay = e.currentTarget.querySelector(".color-overlay");
      if (overlay) {
        gsap.to(overlay, {
          opacity: 0.3,
          duration: 0.3,
        });
      }
    }
  };

  const handleMouseLeave = (e: React.MouseEvent<HTMLDivElement, MouseEvent>, item: any) => {
    const selector = `[data-key="${item.id}"]`;

    if (scaleOnHover) {
      gsap.to(selector, {
        scale: 1,
        duration: 0.3,
        ease: "power2.out"
      });
    }

    if (colorShiftOnHover) {
      const overlay = e.currentTarget.querySelector(".color-overlay");
      if (overlay) {
        gsap.to(overlay, {
          opacity: 0,
          duration: 0.3,
        });
      }
    }
  };

  const handleClick = (item: MasonryItem) => {
    if(item.url) {
        window.open(item.url, "_blank", "noopener, noreferrer")
    }
  }

  return (
    <div ref={containerRef} className="list" style={{height: grid.containerHeight}}>
      {grid.gridItems.map((item) => {
        return (
          <div
            key={item.id}
            data-key={item.id}
            className="item-wrapper"
            onClick={() => handleClick(item)}
            onMouseEnter={(e) => handleMouseEnter(e, item)}
            onMouseLeave={(e) => handleMouseLeave(e, item)}
            style={{
              opacity: hasMounted.current ? 1 : 0,
            }}
          >
            <div
              className="item-img"
              style={{ backgroundImage: `url(${item.img})` }}
              data-ai-hint={item.dataAiHint}
            >
              {colorShiftOnHover && (
                <div
                  className="color-overlay"
                  style={{
                    position: "absolute",
                    top: 0,
                    left: 0,
                    width: "100%",
                    height: "100%",
                    background:
                      "linear-gradient(45deg, rgba(255,0,150,0.5), rgba(0,150,255,0.5))",
                    opacity: 0,
                    pointerEvents: "none",
                    borderRadius: "8px",
                  }}
                />
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
};
