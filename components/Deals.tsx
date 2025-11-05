import React, { useState, useEffect, useRef } from 'react';
import { dealStages } from '../data/mockData';
import { Deal, DealStage, Contact, ActivityType } from '../types';
import { supabase } from '../supabaseClient'; // Import Supabase
import { Session } from '@supabase/supabase-js';

interface DealsProps {
    session: Session | null;
    deals: Deal[];
    setDeals: React.Dispatch<React.SetStateAction<Deal[]>>;
    contacts: Contact[];
    addActivity: (type: ActivityType, details: string) => void;
}

const inputClasses = "w-full px-3 py-2 rounded-md bg-secondary dark:bg-dark-secondary border border-border dark:border-dark-border focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary text-sm";

const KanbanCard: React.FC<{ 
    deal: Deal; 
    contact?: Contact;
    isDragging: boolean;
    onDragStart: (e: React.DragEvent<HTMLDivElement>, dealId: number) => void;
    onDragEnd: () => void;
    onEdit: (deal: Deal) => void;
    onDelete: (id: number) => void;
}> = ({ deal, contact, isDragging, onDragStart, onDragEnd, onEdit, onDelete }) => {
    const [isMenuOpen, setIsMenuOpen] = useState(false);
    const menuRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
                setIsMenuOpen(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);
        const displayProbability = Math.min(deal.probability, 100);

    return (
        <div
            draggable
            onDragStart={(e) => onDragStart(e, deal.id)}
            onDragEnd={onDragEnd}
            className={`group bg-card dark:bg-dark-card p-4 rounded-xl border border-border dark:border-dark-border transition-all relative cursor-grab active:cursor-grabbing ${
                isDragging 
                ? 'shadow-lg ring-2 ring-primary' 
                : 'shadow-sm hover:shadow-md'
            }`}
        >
            <div className="relative">
                 <h4 className="font-medium text-muted-foreground dark:text-dark-muted-foreground mb-1 pr-6 truncate">{deal.title}</h4>
                 <div className="absolute -top-2 -right-2" ref={menuRef}>
                    <button onClick={() => setIsMenuOpen(!isMenuOpen)} className="p-1 text-muted-foreground dark:text-dark-muted-foreground opacity-0 group-hover:opacity-100 focus:opacity-100 transition-opacity rounded-full hover:bg-secondary dark:hover:bg-dark-secondary">
                        <i data-lucide="more-horizontal" className="w-5 h-5"></i>
                    </button>
                    {isMenuOpen && (
                        <div className="absolute right-0 mt-1 w-32 bg-card dark:bg-dark-card border dark:border-dark-border rounded-md shadow-lg z-10 py-1">
                            <a href="#" onClick={(e) => { e.preventDefault(); onEdit(deal); setIsMenuOpen(false); }} className="flex items-center w-full text-left px-3 py-1.5 text-sm text-foreground dark:text-dark-foreground hover:bg-secondary dark:hover:bg-dark-secondary">Edit</a>
                            <a href="#" onClick={(e) => { e.preventDefault(); onDelete(deal.id); setIsMenuOpen(false); }} className="flex items-center w-full text-left px-3 py-1.5 text-sm text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20">Delete</a>
                        </div>
                    )}
                 </div>
            </div>

            <p className="text-3xl font-bold text-foreground/90 dark:text-dark-foreground/90 mb-3">${deal.value.toLocaleString()}</p>
            
            <div className="mb-4">
                <div className="flex justify-between items-center mb-1">
                    <span className="text-xs font-medium text-muted-foreground dark:text-dark-muted-foreground">Probability</span>
                    <span className="text-xs font-medium text-muted-foreground dark:text-dark-muted-foreground">{displayProbability}%</span>
                </div>
                <div className="w-full bg-secondary dark:bg-dark-secondary rounded-full h-1.5 overflow-hidden" >
                    <div className="bg-primary h-1.5 rounded-full" style={{ width: `${displayProbability}%` }}></div>
                </div>
            </div>

            <div className="flex justify-between items-center pt-3 border-t border-border dark:border-dark-border">
                <div className="flex items-center">
                    {contact && <img src={contact.avatarUrl} alt={contact.name} className="w-7 h-7 rounded-full mr-2" />}
                    <span className="text-sm font-medium text-foreground/90 dark:text-dark-foreground/90 truncate">{deal.contactName}</span>
                </div>
                <div className="flex items-center text-sm text-muted-foreground dark:text-dark-muted-foreground">
                    <i data-lucide="check-circle" className="w-4 h-4 mr-1.5"></i>
                    <span>1/3</span>
                </div>
            </div>
        </div>
    );
};

const KanbanColumn: React.FC<{ 
    stage: DealStage; 
    deals: Deal[];
    contacts: Contact[];
    draggingDealId: number | null;
    onDragStart: (e: React.DragEvent<HTMLDivElement>, dealId: number) => void;
    onDragEnd: () => void;
    onDrop: (e: React.DragEvent<HTMLDivElement>, stage: DealStage) => void;
    onEdit: (deal: Deal) => void;
    onDelete: (id: number) => void;
}> = ({ stage, deals, contacts, draggingDealId, onDragStart, onDragEnd, onDrop, onEdit, onDelete }) => {
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
    
    const totalValue = deals.reduce((sum, deal) => sum + deal.value, 0);

    const stageColors: Record<DealStage, string> = {
      'Lead In': 'bg-blue-500',
      'Contact Made': 'bg-cyan-500',
      'Proposal Sent': 'bg-purple-500',
      'Won': 'bg-primary',
      'Lost': 'bg-red-500'
    };

    return (
        <div
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
            className={`flex-shrink-0 w-80 bg-secondary dark:bg-dark-secondary/50 rounded-xl flex flex-col transition-all duration-200 border-2 ${isOver ? 'border-dashed border-primary/80' : 'border-transparent'}`}
        >
            <div className="p-4 flex justify-between items-center flex-shrink-0">
                <div className="flex items-center">
                    <span className={`w-2 h-2 rounded-full mr-2.5 ${stageColors[stage]}`}></span>
                    <h3 className="font-semibold text-foreground dark:text-dark-foreground">{stage}</h3>
                </div>
                <span className="text-sm font-medium text-muted-foreground dark:text-dark-muted-foreground bg-background dark:bg-dark-background px-2 py-0.5 rounded-md">{deals.length}</span>
            </div>
            <p className="text-xs text-muted-foreground dark:text-dark-muted-foreground font-medium px-4 mb-3">
                Value: ${totalValue.toLocaleString()}
            </p>
            <div className="flex-1 overflow-y-auto px-4 pb-2 space-y-4">
                {deals.map(deal => (
                    <KanbanCard 
                        key={deal.id} 
                        deal={deal} 
                        contact={contacts.find(c => c.id === deal.contactId)}
                        onDragStart={onDragStart} 
                        onEdit={onEdit} 
                        onDelete={onDelete} 
                        onDragEnd={onDragEnd}
                        isDragging={draggingDealId === deal.id}
                    />
                ))}
            </div>
        </div>
    );
};

const Deals: React.FC<DealsProps> = ({session, deals, setDeals, contacts, addActivity }) => {
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingDeal, setEditingDeal] = useState<Deal | null>(null);
    const [draggingDealId, setDraggingDealId] = useState<number | null>(null);

    const initialFormState: Omit<Deal, 'id' | 'createdDate'> = { title: '', value: 0, contactId: 0, probability: 0, contactName: '', stage: 'Lead In' };
    const [formData, setFormData] = useState<Omit<Deal, 'id' | 'createdDate'>>(initialFormState);
    
    // Function to get deals from Supabase
    const getDeals = async () => {
        const { data, error } = await supabase
            .from('deals')
            .select('*')
            .order('id', { ascending: false });

        if (error) {
            console.error('Error fetching deals:', error.message);
        } else {
            setDeals(data || []);
        }
    };

    useEffect(() => {
        getDeals(); // Fetch deals when the component loads
        // @ts-ignore
        if (window.lucide) {
            // @ts-ignore
            window.lucide.createIcons();
        }
    }, [isModalOpen]);
    
    useEffect(() => {
        if (editingDeal) {
            setFormData(editingDeal);
        } else {
            setFormData(initialFormState);
        }
    }, [editingDeal, isModalOpen]);

    const handleDragStart = (e: React.DragEvent<HTMLDivElement>, dealId: number) => {
        e.dataTransfer.setData("dealId", dealId.toString());
        setDraggingDealId(dealId);
    };

    const handleDragEnd = () => {
        setDraggingDealId(null);
    };

    const handleDrop = async (e: React.DragEvent<HTMLDivElement>, targetStage: DealStage) => {
        const dealId = parseInt(e.dataTransfer.getData("dealId"), 10);
        const dealToMove = deals.find(d => d.id === dealId);
        
        if (dealToMove && dealToMove.stage !== targetStage) {
            const { error } = await supabase
                .from('deals')
                .update({ stage: targetStage })
                .eq('id', dealId);

            if (error) {
                alert(`Error: ${error.message}`);
                console.error('Error updating deal stage:', error);
            } else {
                if (targetStage === 'Won') {
                    addActivity('deal_won', `Won the "${dealToMove.title}" deal.`);
                }
                await getDeals(); // Refresh the data from the server
            }
        }
    };
    
    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: name === 'value' || name === 'contactId' || name === 'probability' ? parseInt(value) || 0 : value }));
    };

    const handleOpenModal = (deal: Deal | null = null) => {
        setEditingDeal(deal);
        setIsModalOpen(true);
    };
    
    const handleCloseModal = () => {
        setIsModalOpen(false);
        setEditingDeal(null);
    };

    const handleSaveDeal = async () => {
        if (!session?.user) return alert("You must be logged in.");
        const selectedContact = contacts.find(c => c.id === formData.contactId);
        if (!formData.title || formData.value <= 0 || !selectedContact) {
            alert('Please fill all fields correctly.');
            return;
        }

        const dealData = {
            ...formData,
            contactName: selectedContact.name,
            user_id: session.user.id,

        };

        if (editingDeal) {
            const { error } = await supabase
                .from('deals')
                .update(dealData)
                .eq('id', editingDeal.id);

            if (error) {
                alert(`Error: ${error.message}`);
            }
        } else {
            const { error } = await supabase
                .from('deals')
                .insert([{ 
                    ...dealData, 
                    createdDate: new Date().toISOString().split('T')[0] 
                }]);
            
            if (error) {
                alert(`Error: ${error.message}`);
            }
        }

        handleCloseModal();
        await getDeals(); // Refresh data
    };

    const handleDeleteDeal = async (id: number) => {
        if (window.confirm("Are you sure you want to delete this deal?")) {
            const { error } = await supabase
                .from('deals')
                .delete()
                .eq('id', id);
            
            if (error) {
                alert(`Error: ${error.message}`);
            }
            await getDeals(); // Refresh data
        }
    };

    return (
      <div className="h-full p-4 md:p-6 flex flex-col">
        <div className="flex flex-col sm:flex-row justify-between sm:items-center mb-6 gap-4 flex-shrink-0">
          <h1 className="text-2xl font-bold text-foreground dark:text-dark-foreground">Deals Pipeline</h1>
           <button onClick={() => handleOpenModal()} className="flex items-center justify-center bg-primary text-primary-foreground px-4 py-2 rounded-md font-medium hover:bg-primary/90 text-sm">
                <i data-lucide="plus" className="w-5 h-5 mr-2"></i>
                Add Deal
            </button>
        </div>
        <div className="flex-1 flex space-x-4 overflow-x-auto pb-4">
            {dealStages.map(stage => (
                <KanbanColumn
                    key={stage}
                    stage={stage}
                    deals={deals.filter(deal => deal.stage === stage)}
                    contacts={contacts}
                    draggingDealId={draggingDealId}
                    onDragStart={handleDragStart}
                    onDragEnd={handleDragEnd}
                    onDrop={handleDrop}
                    onEdit={handleOpenModal}
                    onDelete={handleDeleteDeal}
                />
            ))}
        </div>

        {isModalOpen && (
            <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center">
                <div className="bg-card dark:bg-dark-card rounded-lg shadow-xl w-full max-w-md m-4">
                    <div className="p-6 border-b border-border dark:border-dark-border">
                        <h3 className="text-lg font-semibold">{editingDeal ? 'Edit Deal' : 'Add New Deal'}</h3>
                    </div>
                    <div className="p-6 space-y-4">
                        <input type="text" name="title" value={formData.title} onChange={handleInputChange} placeholder="Deal Title" className={inputClasses} />
                        <input type="number" name="value" value={formData.value} onChange={handleInputChange} placeholder="Value ($)" className={inputClasses} />
                        <select name="contactId" value={formData.contactId} onChange={handleInputChange} className={inputClasses}>
                            <option value="">Select Contact</option>
                            {contacts.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                        </select>
                        <input type="number" name="probability" value={formData.probability} onChange={handleInputChange} placeholder="Probability (%)" className={inputClasses} />
                    </div>
                    <div className="p-4 bg-secondary/50 dark:bg-dark-secondary/50 rounded-b-lg flex justify-end space-x-3">
                        <button onClick={handleCloseModal} className="px-4 py-2 text-sm font-medium rounded-md bg-card dark:bg-dark-card border border-border dark:border-dark-border hover:bg-secondary dark:hover:bg-dark-secondary">Cancel</button>
                        <button onClick={handleSaveDeal} className="px-4 py-2 text-sm font-medium rounded-md bg-primary text-primary-foreground hover:bg-primary/90">Save Deal</button>
                    </div>
                </div>
            </div>
        )}
      </div>
    );
};

export default Deals;