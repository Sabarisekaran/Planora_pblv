import { useEffect, useState } from "react";

interface EventTabsProps {
  tabs: string[];
  children?: React.ReactNode[];
  rightContent?: React.ReactNode;
  activeTab?: number;
}

const EventTabs = ({ tabs, children, rightContent, activeTab }: EventTabsProps) => {
  const [active, setActive] = useState(activeTab ?? 0);

  useEffect(() => {
    if (typeof activeTab === "number") {
      setActive(activeTab);
    }
  }, [activeTab]);

  return (
    <div>
      <div className="flex items-end justify-between border-b border-border pb-0">
        <div className="flex gap-6">
          {tabs.map((tab, i) => (
            <button
              key={tab}
              onClick={() => setActive(i)}
              className={`text-sm pb-3 font-medium transition-colors ${
                i === active
                  ? "border-b-2 border-primary text-primary"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              {tab}
            </button>
          ))}
        </div>
        {rightContent && <div className="pb-2">{rightContent}</div>}
      </div>
      <div className="mt-6">{children && children[active]}</div>
    </div>
  );
};

export default EventTabs;
