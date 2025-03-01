'use client';

import Image from 'next/image';
import { plex } from '@/app/fonts/plex';
import { useTranslations } from 'next-intl';
import { useParams } from 'next/navigation';

import logo from '../../../public/logo/logo-openport-rose.svg';

import seaBackground from '../../../public/sea.svg';
import Boat from './Boat';

import progress0 from '../../../public/progress/progress-0.svg';
import progress25 from '../../../public/progress/progress-25.svg';
import progress50 from '../../../public/progress/progress-50.svg';
import progress75 from '../../../public/progress/progress-75.svg';
import progress100 from '../../../public/progress/progress-100.svg';

interface SeaProps {
  progress: number;
  showAllBoats?: boolean;
}

export default function Sea({ progress, showAllBoats = false }: SeaProps) {
  const t = useTranslations('dashboardSea');
  const params = useParams();
  const locale = params.locale as string;
  const ProgressImage = ({ progress }: { progress: number }) => {
    let img;
    let scale = 1;
    let left = 48;
    let top = 87;
    if (progress === 0) {
      img = progress0;
    } else if (progress <= 25) {
      img = progress25;
    } else if (progress <= 50) {
      img = progress50;
    } else if (progress <= 75) {
      img = progress75;
    } else if (progress <= 100) {
      img = progress100;
      scale = 1.5;
      left = 47;
      top = 80;
    }

    return (
      <div className="relative z-30 top-24">
        <Image
          src={img}
          width={80 * scale}
          height={82 * scale}
          alt=""
          className="absolute"
          style={{ left: `${left}%`, top: `${top}%`, zIndex: 0 }}
        ></Image>
      </div>
    );
  };

  const Boats = ({ progress }: { progress: number }) => {
    if (showAllBoats) {
      return (
        <>
          <Boat model={1} top={65} left={46.5} scale={1} />
          <Boat model={2} top={85} left={6.5} scale={1.2} zindex={10} />
          <Boat model={3} top={75} left={26.5} scale={1.2} />
          <Boat model={4} top={80} left={66.5} scale={1.5} />
          <Boat model={8} top={90} left={86.5} scale={2} />
        </>
      );
    }

    if (progress === 0)
      return (
        <>
          <Boat model={1} top={67} left={46.5} />
        </>
      );
    if (progress <= 25)
      return (
        <>
          <Boat model={1} top={65} left={46.5} />
          <Boat model={2} top={85} left={6.5} scale={1.2} />
        </>
      );
    if (progress <= 50)
      return (
        <>
          <Boat model={1} top={65} left={46.5} scale={1} />
          <Boat model={2} top={85} left={6.5} scale={1.2} />
          <Boat model={4} top={80} left={66.5} scale={1.5} />
        </>
      );
    if (progress <= 75)
      return (
        <>
          <Boat model={1} top={65} left={46.5} scale={1} />
          <Boat model={2} top={85} left={6.5} scale={1.2} zindex={10} />
          <Boat model={3} top={75} left={26.5} scale={1.2} />
          <Boat model={4} top={80} left={66.5} scale={1.5} />
        </>
      );
    if (progress <= 100)
      return (
        <>
          <Boat model={1} top={61} left={45} scale={1.5} />
          <Boat model={2} top={85} left={6.5} scale={1.2} zindex={10} />
          <Boat model={3} top={75} left={26.5} scale={1.2} />
          <Boat model={4} top={80} left={66.5} scale={1.5} />
          <Boat model={8} top={90} left={86.5} scale={2} />
        </>
      );
  };

  return (
    <div className="absolute top-0 left-0 w-full h-[23rem]">
      <Image src={seaBackground} fill alt="" className="object-cover"></Image>
      <div className="relative z-[5] pt-12">
        <Image
          src={logo}
          alt={t('logo.alt')}
          width={306}
          height={125}
          className="mx-auto"
        />
        <div className="container flex flex-col mx-auto text-center gap-y-4 px-6 lg:gap-y-8 relative mt-1 md:mt-6">
          <h1 className={`${plex.className} text-2xl lg:text-3xl font-light text-blue-500`}>
            {t('welcome')}
          </h1>
        </div>
      </div>
      <Boats progress={progress} />
      {!showAllBoats && <ProgressImage progress={progress} />}
    </div>
  );
}
