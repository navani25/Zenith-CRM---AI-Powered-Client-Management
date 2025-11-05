import React, { useState, useMemo, useEffect, useRef } from 'react';
import { Contact, ActivityType, CustomField } from '../types';
import { supabase } from '../supabaseClient';

type ViewMode = 'list' | 'grid';

interface LeadsProps {
    contacts: Contact[];
    setContacts: React.Dispatch<React.SetStateAction<Contact[]>>;
    addActivity: (type: ActivityType, details: string) => void;
}

const inputClasses = "w-full px-3 py-2 rounded-md bg-secondary dark:bg-dark-secondary border border-border dark:border-dark-border focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary text-sm";

const LeadCard: React.FC<{ lead: Contact, onEdit: (c: Contact) => void, onDelete: (id: number) => void }> = ({ lead, onEdit, onDelete }) => (
    <div className="bg-card dark:bg-dark-card border border-border dark:border-dark-border rounded-lg p-4 transition-shadow hover:shadow-md flex flex-col">
        <div className="flex items-start justify-between mb-4">
            <div className="flex items-center space-x-3">
                <img src={lead.avatarUrl} alt={lead.name} className="w-10 h-10 rounded-full" />
                <div>
                    <p className="font-semibold text-foreground dark:text-dark-foreground">{lead.name}</p>
                    <p className="text-sm text-muted-foreground dark:text-dark-muted-foreground">{lead.company}</p>
                </div>
            </div>
            <div className="relative group">
              <button className="p-1 text-muted-foreground dark:text-dark-muted-foreground hover:text-foreground dark:hover:text-dark-foreground">
                  <i data-lucide="more-horizontal" className="w-5 h-5"></i>
              </button>
              <div className="absolute right-0 mt-1 w-32 bg-card dark:bg-dark-card border dark:border-dark-border rounded-md shadow-lg z-10 hidden group-hover:block">
                <a href="#" onClick={(e) => { e.preventDefault(); onEdit(lead); }} className="block px-4 py-2 text-sm text-foreground dark:text-dark-foreground hover:bg-secondary dark:hover:bg-dark-secondary">Edit</a>
                <a href="#" onClick={(e) => { e.preventDefault(); onDelete(lead.id); }} className="block px-4 py-2 text-sm text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20">Delete</a>
              </div>
            </div>
        </div>
        
        <div className="space-y-2 text-sm text-left mb-4 flex-grow">
            <div className="flex items-center text-muted-foreground dark:text-dark-muted-foreground">
                <i data-lucide="mail" className="w-4 h-4 mr-2"></i>
                <span className="truncate">{lead.email}</span>
            </div>
            <div className="flex items-center text-muted-foreground dark:text-dark-muted-foreground">
                <i data-lucide="phone" className="w-4 h-4 mr-2"></i>
                <span>{lead.phone}</span>
            </div>
             {lead.customFields && lead.customFields.length > 0 && (
                <div className="pt-2 mt-2 border-t border-border dark:border-dark-border space-y-1">
                    {lead.customFields.map(field => (
                        <div key={field.id} className="flex items-center text-muted-foreground dark:text-dark-muted-foreground">
                            <span className="font-medium w-24 flex-shrink-0 truncate">{field.key}:</span>
                            <span className="truncate">{field.value}</span>
                        </div>
                    ))}
                </div>
            )}
        </div>

        <div className="flex space-x-2 mt-auto">
            <button onClick={() => alert(`Calling ${lead.name}...`)} className="flex-1 flex items-center justify-center text-sm border border-border dark:border-dark-border py-2 rounded-md hover:bg-secondary dark:hover:bg-dark-secondary text-foreground dark:text-dark-foreground font-medium">
                <i data-lucide="phone-call" className="w-4 h-4 mr-2"></i>
                Call
            </button>
            <button onClick={() => alert(`Emailing ${lead.name}...`)} className="flex-1 flex items-center justify-center text-sm border border-border dark:border-dark-border py-2 rounded-md hover:bg-secondary dark:hover:bg-dark-secondary text-foreground dark:text-dark-foreground font-medium">
                <i data-lucide="mail" className="w-4 h-4 mr-2"></i>
                Mail
            </button>
        </div>
    </div>
);


const Leads: React.FC<LeadsProps> = ({ contacts, setContacts, addActivity }) => {
    const leads = useMemo(() => contacts.filter(c => c.status === 'lead'), [contacts]);
    const [searchTerm, setSearchTerm] = useState('');
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingLead, setEditingLead] = useState<Contact | null>(null);
    const [viewMode, setViewMode] = useState<ViewMode>('list');
    const [avatarPreview, setAvatarPreview] = useState<string | null>(null);
    const fileInputRef = useRef<HTMLInputElement>(null);

    const initialFormState: Omit<Contact, 'id'> = { name: '', email: '', company: '', phone: '', status: 'lead', avatarUrl: '', customFields: [] };
    const [formData, setFormData] = useState<Omit<Contact, 'id'> & { id?: number }>(initialFormState);

    const getContacts = async () => {
        const { data, error } = await supabase
            .from('contacts')
            .select('*')
            .order('id', { ascending: false });
        
        if (error) {
            console.error('Error fetching contacts:', error.message);
        } else {
            setContacts(data || []);
        }
    }

    useEffect(() => {
        // @ts-ignore
        if (window.lucide) {
            // @ts-ignore
            window.lucide.createIcons();
        }
    }, [leads, isModalOpen, viewMode, formData.customFields]);

    useEffect(() => {
        if (isModalOpen) {
            if (editingLead) {
                setFormData(editingLead);
                setAvatarPreview(editingLead.avatarUrl);
            } else {
                setFormData(initialFormState);
                setAvatarPreview(null);
            }
        }
    }, [editingLead, isModalOpen]);

    const filteredLeads = useMemo(() => {
        return leads.filter(lead =>
            lead.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
            lead.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
            lead.company.toLowerCase().includes(searchTerm.toLowerCase())
        );
    }, [searchTerm, leads]);

    const handleOpenModal = (lead: Contact | null = null) => {
        setEditingLead(lead);
        setIsModalOpen(true);
    };

    const handleCloseModal = () => {
        setIsModalOpen(false);
        setEditingLead(null);
        setFormData(initialFormState);
    };

    const handleSaveLead = async () => {
        const leadData = { 
            ...formData, 
            status: 'lead' as const, 
            avatarUrl: avatarPreview || formData.avatarUrl || `https://picsum.photos/seed/${Date.now()}/40/40`,
        };
        delete leadData.customFields; // Omit custom fields for now

        if (editingLead) {
            const { error } = await supabase
                .from('contacts')
                .update(leadData)
                .eq('id', editingLead.id);
            
            if (error) alert(`Error: ${error.message}`);
        } else {
            const { error } = await supabase
                .from('contacts')
                .insert([leadData]);

            if (error) {
                alert(`Error: ${error.message}`);
            } else {
                addActivity('new_lead', `New lead assigned: "${formData.name}".`);
            }
        }
        
        await getContacts();
        handleCloseModal();
    };

    const handleDeleteLead = async (id: number) => {
        if (window.confirm('Are you sure you want to delete this lead?')) {
            const { error } = await supabase
                .from('contacts')
                .delete()
                .eq('id', id);

            if (error) alert(`Error: ${error.message}`);
            await getContacts();
        }
    };

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };
    
    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            const reader = new FileReader();
            reader.onloadend = () => {
                setAvatarPreview(reader.result as string);
            };
            reader.readAsDataURL(file);
        }
    };
    
    const handleCustomFieldChange = (index: number, field: 'key' | 'value', value: string) => {
        const newCustomFields = [...(formData.customFields || [])];
        newCustomFields[index] = { ...newCustomFields[index], [field]: value };
        setFormData(prev => ({ ...prev, customFields: newCustomFields }));
    };

    const handleAddCustomField = () => {
        const newField: CustomField = { id: Date.now(), key: '', value: '' };
        setFormData(prev => ({ ...prev, customFields: [...(prev.customFields || []), newField] }));
    };

    const handleRemoveCustomField = (index: number) => {
        const newCustomFields = [...(formData.customFields || [])];
        newCustomFields.splice(index, 1);
        setFormData(prev => ({ ...prev, customFields: newCustomFields }));
    };
    
    const ViewToggle = () => (
      <div className="flex items-center p-1 bg-secondary dark:bg-dark-secondary rounded-md">
        <button onClick={() => setViewMode('list')} className={`p-1.5 rounded-md transition-colors ${viewMode === 'list' ? 'bg-primary text-primary-foreground' : 'text-muted-foreground dark:text-dark-muted-foreground hover:bg-card dark:hover:bg-dark-card'}`}>
          <i data-lucide="list" className="w-5 h-5"></i>
        </button>
        <button onClick={() => setViewMode('grid')} className={`p-1.5 rounded-md transition-colors ${viewMode === 'grid' ? 'bg-primary text-primary-foreground' : 'text-muted-foreground dark:text-dark-muted-foreground hover:bg-card dark:hover:bg-dark-card'}`}>
          <i data-lucide="layout-grid" className="w-5 h-5"></i>
        </button>
      </div>
    );

    return (
        <div className="h-full overflow-y-auto p-4 md:p-6">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 gap-4">
                <h1 className="text-2xl font-bold text-foreground dark:text-dark-foreground">Leads</h1>
                <div className="flex items-center space-x-2 w-full md:w-auto">
                    <ViewToggle />
                    <button className="flex items-center text-sm bg-card dark:bg-dark-card border border-border dark:border-dark-border px-4 py-2 rounded-md font-medium hover:bg-secondary dark:hover:bg-dark-secondary flex-grow justify-center md:flex-grow-0">
                        <i data-lucide="filter" className="w-4 h-4 mr-2"></i>
                        Filter
                    </button>
                    <button onClick={() => handleOpenModal()} className="flex items-center bg-primary text-primary-foreground px-4 py-2 rounded-md font-medium hover:bg-primary/90 text-sm flex-grow justify-center md:flex-grow-0">
                        <i data-lucide="plus" className="w-5 h-5 mr-2"></i>
                        Add Lead
                    </button>
                </div>
            </div>
            
            {viewMode === 'grid' ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                    {filteredLeads.map(lead => (
                        <LeadCard key={lead.id} lead={lead} onEdit={handleOpenModal} onDelete={handleDeleteLead}/>
                    ))}
                </div>
            ) : (
                <div className="bg-card dark:bg-dark-card rounded-lg border border-border dark:border-dark-border">
                    <div className="overflow-x-auto">
                        <table className="w-full text-left text-sm">
                            <thead>
                                <tr className="border-b border-border dark:border-dark-border">
                                    <th className="p-4 font-semibold whitespace-nowrap">Name</th>
                                    <th className="p-4 font-semibold whitespace-nowrap">Email</th>
                                    <th className="p-4 font-semibold whitespace-nowrap">Company</th>
                                    <th className="p-4 font-semibold whitespace-nowrap">Phone</th>
                                    <th className="p-4 font-semibold whitespace-nowrap">Actions</th>
                                </tr>
                            </thead>
                            <tbody>
                                {filteredLeads.map(contact => (
                                    <tr key={contact.id} className="border-b border-border dark:border-dark-border last:border-0 hover:bg-secondary dark:hover:bg-dark-secondary">
                                        <td className="p-4 flex items-center">
                                            <img src={contact.avatarUrl} alt={contact.name} className="w-8 h-8 rounded-full mr-3"/>
                                            <span className="font-medium whitespace-nowrap">{contact.name}</span>
                                        </td>
                                        <td className="p-4 text-muted-foreground dark:text-dark-muted-foreground">{contact.email}</td>
                                        <td className="p-4 text-muted-foreground dark:text-dark-muted-foreground">{contact.company}</td>
                                        <td className="p-4 text-muted-foreground dark:text-dark-muted-foreground">{contact.phone}</td>
                                        <td className="p-4">
                                            <div className="flex items-center">
                                                <button onClick={() => handleOpenModal(contact)} className="p-1 text-muted-foreground dark:text-dark-muted-foreground hover:text-foreground dark:hover:text-dark-foreground">
                                                    <i data-lucide="edit-3" className="w-4 h-4"></i>
                                                </button>
                                                <button onClick={() => handleDeleteLead(contact.id)} className="p-1 text-muted-foreground dark:text-dark-muted-foreground hover:text-red-600">
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
            )}

            {isModalOpen && (
                <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center">
                    <div className="bg-card dark:bg-dark-card rounded-lg shadow-xl w-full max-w-lg m-4">
                        <div className="p-6 border-b border-border dark:border-dark-border">
                            <h3 className="text-lg font-semibold">{editingLead ? 'Edit Lead' : 'Add New Lead'}</h3>
                        </div>
                        <div className="p-6 space-y-4 max-h-[70vh] overflow-y-auto">
                             <div className="flex items-center space-x-4">
                                <img src={avatarPreview || `https://ui-avatars.com/api/?name=${formData.name || 'A'}&background=random`} alt="Avatar Preview" className="w-16 h-16 rounded-full object-cover bg-secondary dark:bg-dark-secondary" />
                                <div>
                                    <input type="file" ref={fileInputRef} onChange={handleFileChange} className="hidden" accept="image/*" />
                                    <button type="button" onClick={() => fileInputRef.current?.click()} className="text-sm font-medium text-primary hover:underline">Change Avatar</button>
                                    <p className="text-xs text-muted-foreground dark:text-dark-muted-foreground mt-1">JPG, GIF or PNG. 1MB max.</p>
                                </div>
                            </div>
                            <input type="text" name="name" value={formData.name} onChange={handleInputChange} placeholder="Full Name" className={inputClasses} />
                            <input type="email" name="email" value={formData.email} onChange={handleInputChange} placeholder="Email" className={inputClasses} />
                            <input type="text" name="company" value={formData.company} onChange={handleInputChange} placeholder="Company" className={inputClasses} />
                            <input type="tel" name="phone" value={formData.phone} onChange={handleInputChange} placeholder="Phone" className={inputClasses} />
                        </div>
                        <div className="p-4 bg-secondary/50 dark:bg-dark-secondary/50 rounded-b-lg flex justify-end">
                            <div className="flex space-x-3">
                                <button type="button" onClick={handleCloseModal} className="px-4 py-2 text-sm font-medium rounded-md bg-card dark:bg-dark-card border border-border dark:border-dark-border hover:bg-secondary dark:hover:bg-dark-secondary">Cancel</button>
                                <button type="button" onClick={handleSaveLead} className="px-4 py-2 text-sm font-medium rounded-md bg-primary text-primary-foreground hover:bg-primary/90">Save Lead</button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default Leads;