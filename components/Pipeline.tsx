
import React, { useState, useEffect } from 'react';
import { dealsData, dealStages } from '../data/mockData';
import { Deal, DealStage } from '../types';

const KanbanCard: React.FC<{ deal: Deal, onDragStart: (e: React.DragEvent<HTMLDivElement>, dealId: number) => void }> = ({ deal, onDragStart }) => (
    <div
        draggable
        onDragStart={(e) => onDragStart(e, deal.id)}
        className="bg-white dark:bg-gray-700 p-4 rounded-lg shadow-sm mb-4 cursor-grab active:cursor-grabbing"
    >
        <h4 className="font-bold text-gray-800 dark:text-gray-100">{deal.title}</h4>
        <p className="text-sm text-gray-500 dark:text-gray-400">{deal.contactName}</p>
        <div className="flex justify-between items-center mt-3">
            <span className="text-lg font-semibold text-primary-600 dark:text-primary-400">${deal.value.toLocaleString()}</span>
            <div className="text-xs px-2 py-1 rounded-full bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200">
                {deal.probability}%
            </div>
        </div>
    </div>
);

const KanbanColumn: React.FC<{ 
    stage: DealStage; 
    deals: Deal[];
    onDragStart: (e: React.DragEvent<HTMLDivElement>, dealId: number) => void;
    onDrop: (e: React.DragEvent<HTMLDivElement>, stage: DealStage) => void;
}> = ({ stage, deals, onDragStart, onDrop }) => {
    const [isOver, setIsOver] = useState(false);

    const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
        e.preventDefault();
        setIsOver(true);
    };

    const handleDragLeave = (e: React.DragEvent<HTMLDivElement>) => {
        e.preventDefault();
        setIsOver(false);
    };

    const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
        onDrop(e, stage);
        setIsOver(false);
    };
    
    const stageColors: Record<DealStage, string> = {
      'Lead In': 'border-t-blue-500',
      'Contact Made': 'border-t-cyan-500',
      'Proposal Sent': 'border-t-purple-500',
      'Won': 'border-t-green-500',
      'Lost': 'border-t-red-500'
    };

    const totalValue = deals.reduce((sum, deal) => sum + deal.value, 0);

    return (
        <div
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
            className={`flex-1 w-72 min-w-72 bg-gray-100 dark:bg-gray-800/50 rounded-lg p-4 transition-colors ${isOver ? 'bg-primary-100 dark:bg-primary-900/50' : ''}`}
        >
            <h3 className={`font-semibold text-lg pb-3 mb-3 border-b-2 ${stageColors[stage]}`}>
                {stage} <span className="text-sm font-normal text-gray-500 dark:text-gray-400">({deals.length})</span>
            </h3>
            <p className="text-sm text-gray-600 dark:text-gray-300 font-bold mb-4">
                Total: ${totalValue.toLocaleString()}
            </p>
            <div className="h-full">
                {deals.map(deal => (
                    <KanbanCard key={deal.id} deal={deal} onDragStart={onDragStart} />
                ))}
            </div>
        </div>
    );
};

const Pipeline: React.FC = () => {
    const [deals, setDeals] = useState<Deal[]>(dealsData);

    const handleDragStart = (e: React.DragEvent<HTMLDivElement>, dealId: number) => {
        e.dataTransfer.setData("dealId", dealId.toString());
    };

    const handleDrop = (e: React.DragEvent<HTMLDivElement>, targetStage: DealStage) => {
        const dealId = parseInt(e.dataTransfer.getData("dealId"), 10);
        setDeals(prevDeals =>
            prevDeals.map(deal =>
                deal.id === dealId ? { ...deal, stage: targetStage } : deal
            )
        );
    };

    return (
        <div className="flex space-x-4 overflow-x-auto pb-4">
            {dealStages.map(stage => (
                <KanbanColumn
                    key={stage}
                    stage={stage}
                    deals={deals.filter(deal => deal.stage === stage)}
                    onDragStart={handleDragStart}
                    onDrop={handleDrop}
                />
            ))}
        </div>
    );
};

export default Pipeline;
