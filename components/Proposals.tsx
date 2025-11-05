import React, { useState, useEffect } from 'react';
import { Proposal, ActivityType, Contact } from '../types';
import { supabase } from '../supabaseClient';
import { Session } from '@supabase/supabase-js';

interface ProposalsProps {
    session: Session | null;
    proposals: Proposal[];
    setProposals: React.Dispatch<React.SetStateAction<Proposal[]>>;
    addActivity: (type: ActivityType, details: string) => void;
    contacts: Contact[];
    isLoading: boolean; // Accept the new isLoading prop
}

const inputClasses = "w-full px-3 py-2 rounded-md bg-secondary dark:bg-dark-secondary border border-border dark:border-dark-border focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary text-sm";

const getStatusClass = (status: Proposal['status']) => {
  switch (status) {
    case 'accepted':
      return 'bg-green-100 text-green-700 dark:bg-green-900/50 dark:text-green-300';
    case 'sent':
      return 'bg-blue-100 text-blue-700 dark:bg-blue-900/50 dark:text-blue-300';
    case 'declined':
      return 'bg-red-100 text-red-700 dark:bg-red-900/50 dark:text-red-300';
    case 'draft':
      return 'bg-secondary text-secondary-foreground dark:bg-dark-secondary dark:text-dark-secondary-foreground';
  }
};

const Proposals: React.FC<ProposalsProps> = ({ session,proposals, setProposals, addActivity, contacts, isLoading }) => {
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingProposal, setEditingProposal] = useState<Proposal | null>(null);

    const initialFormState = { title: '', contactId: '', value: 0, status: 'draft' as Proposal['status'] };
    const [formData, setFormData] = useState(initialFormState);
    
    useEffect(() => {
        // @ts-ignore
        if (window.lucide) {
            // @ts-ignore
            window.lucide.createIcons();
        }
    }, [proposals, isModalOpen]);
    
    useEffect(() => {
        if (isModalOpen) {
            if (editingProposal) {
                setFormData({
                    title: editingProposal.title,
                    contactId: String(editingProposal.contactId),
                    value: editingProposal.value,
                    status: editingProposal.status
                });
            } else {
                setFormData(initialFormState);
            }
        }
    }, [editingProposal, isModalOpen]);

    const handleOpenModal = (proposal: Proposal | null = null) => {
        setEditingProposal(proposal);
        setIsModalOpen(true);
    };

    const handleCloseModal = () => {
        setIsModalOpen(false);
        setEditingProposal(null);
        setFormData(initialFormState);
    };
    
    const handleSaveProposal = async () => {
        if (!session?.user) return alert("You must be logged in.");

        const selectedContact = contacts.find(c => c.id === Number(formData.contactId));
        if (!selectedContact) {
            alert("Please select a valid contact.");
            return;
        }

        const proposalData = {
            user_id: session.user.id,
            title: formData.title,
            value: Number(formData.value),
            status: formData.status,
            contactId: selectedContact.id,
            contactName: selectedContact.name,
            lastUpdated: new Date().toISOString().split('T')[0],
        };

        if (editingProposal) {
            const { error } = await supabase
                .from('proposals')
                .update(proposalData)
                .eq('id', editingProposal.id);

            if (error) {
                alert(`Error: ${error.message}`);
            } else if (proposalData.status === 'accepted' && editingProposal.status !== 'accepted') {
                 addActivity('proposal_accepted', `Accepted the "${proposalData.title}" proposal.`);
            }
        } else {
             const { error } = await supabase
                .from('proposals')
                .insert([{
                    ...proposalData,
                    createdDate: new Date().toISOString().split('T')[0]
                }]);

            if (error) {
                alert(`Error: ${error.message}`);
            } else if (proposalData.status === 'accepted') {
                addActivity('proposal_accepted', `Accepted the "${proposalData.title}" proposal.`);
            }
        }
        
        const { data, error } = await supabase.from('proposals').select('*').order('id', { ascending: false });
        if (!error) setProposals(data || []);

        handleCloseModal();
    };

    const handleDeleteProposal = async (id: number) => {
        if (window.confirm('Are you sure you want to delete this proposal?')) {
            const { error } = await supabase
                .from('proposals')
                .delete()
                .eq('id', id);

            if (error) alert(`Error: ${error.message}`);
            
            const { data: newData, error: fetchError } = await supabase.from('proposals').select('*').order('id', { ascending: false });
            if (!fetchError) setProposals(newData || []);
        }
    };
    
    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    return (
        <div className="h-full overflow-y-auto p-4 md:p-6">
            <div className="flex flex-col sm:flex-row justify-between sm:items-center mb-6 gap-4">
                <h1 className="text-2xl font-bold text-foreground dark:text-dark-foreground">Proposals</h1>
                <button onClick={() => handleOpenModal()} className="flex items-center justify-center bg-primary text-primary-foreground px-4 py-2 rounded-md font-medium hover:bg-primary/90 text-sm">
                    <i data-lucide="plus" className="w-5 h-5 mr-2"></i>
                    New Proposal
                </button>
            </div>
            <div className="bg-card dark:bg-dark-card rounded-lg border border-border dark:border-dark-border">
                <div className="overflow-x-auto">
                    <table className="w-full text-left text-sm">
                        <thead className="border-b border-border dark:border-dark-border">
                            <tr>
                                <th className="p-4 font-semibold whitespace-nowrap">Title</th>
                                <th className="p-4 font-semibold whitespace-nowrap">Client</th>
                                <th className="p-4 font-semibold whitespace-nowrap">Value</th>
                                <th className="p-4 font-semibold whitespace-nowrap">Status</th>
                                <th className="p-4 font-semibold whitespace-nowrap">Last Updated</th>
                                <th className="p-4 font-semibold whitespace-nowrap">Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {proposals && proposals.map(proposal => (
                                <tr key={proposal.id} className="border-b border-border dark:border-dark-border last:border-0 hover:bg-secondary dark:hover:bg-dark-secondary">
                                    <td className="p-4 font-medium text-foreground dark:text-dark-foreground">{proposal.title}</td>
                                    <td className="p-4 text-muted-foreground dark:text-dark-muted-foreground">{proposal.contactName}</td>
                                    <td className="p-4 text-muted-foreground dark:text-dark-muted-foreground">${Number(proposal.value).toLocaleString()}</td>
                                    <td className="p-4">
                                        <span className={`px-2 py-1 text-xs font-medium rounded-full ${getStatusClass(proposal.status)}`}>
                                            {proposal.status.charAt(0).toUpperCase() + proposal.status.slice(1)}
                                        </span>
                                    </td>
                                    <td className="p-4 text-muted-foreground dark:text-dark-muted-foreground">{new Date(proposal.lastUpdated + 'T00:00:00').toLocaleDateString()}</td>
                                    <td className="p-4">
                                        <div className="flex items-center">
                                            <button onClick={() => alert(JSON.stringify(proposal, null, 2))} className="p-1 text-muted-foreground dark:text-dark-muted-foreground hover:text-foreground dark:hover:text-dark-foreground">
                                                <i data-lucide="eye" className="w-4 h-4"></i>
                                            </button>
                                            <button onClick={() => handleOpenModal(proposal)} className="p-1 text-muted-foreground dark:text-dark-muted-foreground hover:text-foreground dark:hover:text-dark-foreground">
                                                <i data-lucide="edit-3" className="w-4 h-4"></i>
                                            </button>
                                            <button onClick={() => handleDeleteProposal(proposal.id)} className="p-1 text-muted-foreground dark:text-dark-muted-foreground hover:text-red-600">
                                                <i data-lucide="trash-2" className="w-4 h-4"></i>
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>

            {isModalOpen && (
                 <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center">
                    <div className="bg-card dark:bg-dark-card rounded-lg shadow-xl w-full max-w-md m-4">
                        <div className="p-6 border-b border-border dark:border-dark-border">
                            <h3 className="text-lg font-semibold">{editingProposal ? 'Edit Proposal' : 'New Proposal'}</h3>
                        </div>
                        <div className="p-6 space-y-4">
                            <input type="text" name="title" value={formData.title} onChange={handleInputChange} placeholder="Proposal Title" className={inputClasses} />
                            <select name="contactId" value={formData.contactId} onChange={handleInputChange} className={inputClasses}>
                                <option value="">Select Contact</option>
                                {contacts && contacts.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                            </select>
                            <input type="number" name="value" value={String(formData.value)} onChange={handleInputChange} placeholder="Value ($)" className={inputClasses} />
                            <select name="status" value={formData.status} onChange={handleInputChange} className={inputClasses}>
                                <option value="draft">Draft</option>
                                <option value="sent">Sent</option>
                                <option value="accepted">Accepted</option>
                                <option value="declined">Declined</option>
                            </select>
                        </div>
                        <div className="p-4 bg-secondary/50 dark:bg-dark-secondary/50 rounded-b-lg flex justify-end space-x-3">
                            <button onClick={handleCloseModal} className="px-4 py-2 text-sm font-medium rounded-md bg-card dark:bg-dark-card border border-border dark:border-dark-border hover:bg-secondary dark:hover:bg-dark-secondary">Cancel</button>
                            <button 
                                onClick={handleSaveProposal} 
                                disabled={isLoading}
                                className="px-4 py-2 text-sm font-medium rounded-md bg-primary text-primary-foreground hover:bg-primary/90 disabled:bg-primary/50"
                            >
                                {isLoading ? 'Loading...' : 'Save Proposal'}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default Proposals;