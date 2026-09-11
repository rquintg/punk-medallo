interface AudioVisualizerProps {
  active?: boolean
}

export default function AudioVisualizer({ active = true }: AudioVisualizerProps) {
  return (
    <div className="flex items-end gap-1 h-5">
      {[0, 1, 2, 3].map((i) => (
        <span
          key={i}
          className="w-1 bg-primary rounded-full"
          style={{
            height: active ? undefined : '4px',
            animation: active ? `equalizer 0.8s ease ${i * 0.12}s infinite` : undefined,
          }}
        />
      ))}
    </div>
  )
}
