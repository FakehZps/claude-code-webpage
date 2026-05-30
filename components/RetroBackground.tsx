import RetroGrid from '@/components/ui/retro-grid'

export default function RetroBackground() {
  return (
    <RetroGrid
      gridColor="#00f3ff"
      showScanlines={false}
      glowEffect={true}
      className="fixed inset-0 z-0"
    />
  )
}
