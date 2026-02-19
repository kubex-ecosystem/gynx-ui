import React from 'react';

interface CardProps {
 title?: string;
 description?: string;
 action?: React.ReactNode;
 children: React.ReactNode;
 className?: string;
}

const Card: React.FC<CardProps> = ({ title, description, action, children, className }) => {
 return (
 <section
 className={`rounded-2xl border p-6 shadow-md transition ${
 className ?? ''
 }`}
 >
 {(title || description || action) && (
 <header className="mb-4 flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between">
 <div>
 {title && <h3 className="text-lg font-semibold text-primary">{title}</h3>}
 {description && <p className="text-sm text-secondary">{description}</p>}
 </div>
 {action && <div className="flex-shrink-0">{action}</div>}
 </header>
 )}
 <div>{children}</div>
 </section>
 );
};

export default Card;
