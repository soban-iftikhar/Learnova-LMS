const ProgressBar = ({ percentage, label, size = 'md' }) => {
  const sizeClasses = {
    sm: 'h-1',
    md: 'h-2',
    lg: 'h-3',
  }

  return (
    <div>
      {label && <p className="text-sm font-medium text-gray-700 mb-2">{label}</p>}
      <div className={`w-full bg-gray-200 rounded-full ${sizeClasses[size]}`}>
        <div
          className="bg-blue-600 rounded-full transition-all"
          style={{ width: `${percentage}%`, height: '100%' }}
        />
      </div>
      <p className="text-xs text-gray-500 mt-1">{percentage}%</p>
    </div>
  )
}

export default ProgressBar
