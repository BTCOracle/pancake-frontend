import { useRouter } from "next/router";
import { cloneElement, RefObject, useCallback, useEffect, useRef } from "react";
import { Autoplay, EffectFade, Pagination } from "swiper/modules";
import { SwiperRef, SwiperSlide } from "swiper/react";
import { StyledSwiper } from "./CarrouselWithSlider";
import { AdSlide } from "./types";
import { useIsSlideExpanded } from "./hooks/useIsSlideExpanded";

export const AdSlidesRender = ({
  adList,
  forceMobile,
  isDismissible,
}: {
  adList: AdSlide[];
  forceMobile?: boolean;
  isDismissible: boolean;
}) => {
  const swiperRef = useRef<SwiperRef>(null);
  const pauseAni = useCallback(() => getTargetAndToggleAnimation(swiperRef), [swiperRef]);
  const resumeAni = useCallback(() => getTargetAndToggleAnimation(swiperRef, false), [swiperRef]);

  const { isAnySlideExpanded, resetAllExpanded } = useIsSlideExpanded();

  const { route } = useRouter();

  useEffect(() => {
    resetAllExpanded();
  }, [route, resetAllExpanded]);

  const handleResume = useCallback(() => {
    if (!isAnySlideExpanded) resumeAni();
  }, [isAnySlideExpanded, resumeAni]);

  useEffect(() => {
    if (swiperRef.current) {
      if (isAnySlideExpanded) {
        swiperRef.current.swiper.autoplay.stop();

        // Disable swiping between slides when expanded
        swiperRef.current.swiper.allowTouchMove = false;

        pauseAni();
      } else {
        swiperRef.current.swiper.autoplay.start();

        // Enable swiping between slides if not expanded
        swiperRef.current.swiper.allowTouchMove = true;

        resumeAni();
      }
    }
  }, [isAnySlideExpanded, pauseAni, resumeAni]);

  const handleSlideChange = useCallback((event: any) => {
    if (swiperRef.current) {
      const activeIndex = swiperRef.current.swiper.realIndex;
      const bullets = swiperRef.current.swiper.pagination.bullets;

      bullets.forEach((bullet: HTMLElement) => {
        bullet.classList.remove("played");
      });

      bullets.slice(0, activeIndex).forEach((bullet) => {
        bullet.classList.add("played");
      });
    }
  }, []);

  return (
    <StyledSwiper
      ref={swiperRef}
      effect="fade"
      spaceBetween={50}
      slidesPerView={1}
      speed={500}
      fadeEffect={{ crossFade: true }}
      autoplay={{ delay: 5000, pauseOnMouseEnter: true, disableOnInteraction: false }}
      pagination={{ clickable: true, enabled: !isAnySlideExpanded }}
      $showPagination={!isAnySlideExpanded}
      modules={[Autoplay, Pagination, EffectFade]}
      onAutoplayPause={pauseAni}
      onAutoplayResume={handleResume}
      onSlideChange={handleSlideChange}
      loop
      observer
      id="test-swiper"
    >
      {adList.map((ad) => (
        <SwiperSlide key={ad.id}>{cloneElement(ad.component, { isDismissible, forceMobile })}</SwiperSlide>
      ))}
    </StyledSwiper>
  );
};

function getTargetAndToggleAnimation(swiperRef: RefObject<SwiperRef>, pause: boolean = true): void {
  const parent = swiperRef.current as HTMLDivElement | null;
  if (!parent) {
    console.warn("swiperRef.current is null or undefined");
    return;
  }
  const target = parent.querySelector(".swiper-pagination-bullet-active") as HTMLDivElement | null;
  if (!target) {
    console.warn("No active pagination bullet found");
    return;
  }
  target.classList.toggle("pause", pause);
}
