const StatCard = ({
  title,
  value,
  icon: Icon,
  description,
}) => {
  return (
    <div
      className="
        group
        rounded-2xl
        border
        border-slate-200
        dark:border-white/10
        bg-white
        dark:bg-white/[0.03]
        p-6
        shadow-sm
        dark:shadow-none
        transition-all
        duration-200
        hover:-translate-y-0.5
        hover:shadow-md
        dark:hover:bg-white/[0.05]
      "
    >
      <div className="flex items-start justify-between">

        {/* Content */}
        <div>

          <p className="text-sm font-medium text-slate-500 dark:text-slate-400">
            {title}
          </p>

          <p className="mt-3 text-3xl font-bold tracking-tight text-slate-900 dark:text-white">
            {value}
          </p>

          {description && (
            <p className="mt-2 text-xs text-slate-400 dark:text-slate-500">
              {description}
            </p>
          )}

        </div>

        {/* Icon */}
        <div
          className="
            flex
            h-11
            w-11
            items-center
            justify-center
            rounded-xl
            bg-indigo-50
            dark:bg-indigo-500/10
            text-indigo-600
            dark:text-indigo-400
            transition
            group-hover:scale-105
          "
        >
          <Icon size={21} strokeWidth={1.9} />
        </div>

      </div>
    </div>
  );
};

export default StatCard;