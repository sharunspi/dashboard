import { Card } from "@windmill/react-ui";
import React from "react";
import { ChevronsDown, ChevronsUp } from "react-feather";
import { animated, config, useSpring } from "react-spring";

function RadialCard({ label, data, dataKey }) {
  const current_used = Math.round(
    (data.current[dataKey].used / data.current[dataKey].total) * 100
  );
  const previous_used = Math.round(
    (data.previous[dataKey].used / data.previous[dataKey].total) * 100
  );
  const diff = current_used - previous_used;

  let _p = Math.round(
    (data.current[dataKey].used / data.current[dataKey].total) * 100
  );

  const { used, total, progress, innerProgress } = useSpring({
    from: { used: 0, total: 0, progress: "0, 100", innerProgress: 0 },
    to: {
      used: data.current[dataKey].used,
      total: data.current[dataKey].total,
      progress: `${isNaN(_p) ? 0 : _p}, 100`,
      innerProgress: isNaN(_p) ? 0 : _p,
    },
    delay: 0,
    config: config.slow,
  });

  const circlePath = `M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831`;

  return (
    <Card className="flex items-center justify-between">
      <div className="relative flex content-center justify-center w-3/4 p-4">
        <svg viewBox="0 0 36 36" className="wheel" width="100%">
          <path
            className="text-gray-100 stroke-current stroke-2 dark:text-gray-400"
            fill="none"
            d={circlePath}
          />
          <animated.path
            className="text-purple-600 stroke-current stroke-2"
            fill="none"
            strokeDasharray={progress}
            d={circlePath}
          />
        </svg>
        <div className="absolute flex flex-col items-center self-center">
          <p className="text-sm font-medium text-gray-600 dark:text-gray-400">
            {label}
          </p>
          <div className="inline-flex">
            <animated.span className="mr-1 text-lg font-semibold text-gray-700 dark:text-gray-200">
              {innerProgress.interpolate((x) => `${Math.round(x)}%`)}
            </animated.span>
            {data.current.count > 0 &&
              (diff > 0 ? (
                <span className="text-red-400">
                  <ChevronsUp className="inline h-full" />
                  {Math.abs(diff)}%
                </span>
              ) : !isNaN(diff) && diff != 0 ? (
                <span className="text-green-400">
                  <ChevronsDown className="inline h-full" />
                  {Math.abs(diff)}%
                </span>
              ) : (
                <span></span>
              ))}
          </div>
        </div>
      </div>
      <div className="grid content-center justify-center w-1/4 grid-cols-1 py-4 pr-6 space-y-2 text-right">
        <div className="flex-col">
          <p className="text-sm font-medium text-gray-600 dark:text-gray-400">
            Used
          </p>
          <animated.p className="text-lg font-semibold text-gray-700 dark:text-gray-200">
            {used.interpolate((x) => Math.round(x))}
          </animated.p>
        </div>
        <div className="flex-col">
          <p className="text-sm font-medium text-gray-600 dark:text-gray-400">
            Total
          </p>
          <animated.p className="text-lg font-semibold text-gray-700 dark:text-gray-200">
            {total.interpolate((x) => Math.round(x))}
          </animated.p>
        </div>
      </div>
    </Card>
  );
}

export default RadialCard;
