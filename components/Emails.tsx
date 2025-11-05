import React, { useState, useEffect } from 'react';
import { EmailTemplate } from '../types';
import { supabase } from '../supabaseClient'; // Import Supabase

const inputClasses = "w-full px-3 py-2 rounded-md bg-secondary dark:bg-dark-secondary border border-border dark:border-dark-border focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary text-sm";


const Emails: React.FC = () => {
  const [selectedTemplate, setSelectedTemplate] = useState<EmailTemplate | null>(null);
  
  const [templates, setTemplates] = useState<EmailTemplate[]>([]);
  const [editedSubject, setEditedSubject] = useState('');
  const [editedBody, setEditedBody] = useState('');

  const getTemplates = async () => {
    const { data, error } = await supabase
      .from('email_templates')
      .select('*')
      .order('id');
    
    if (error) {
        console.error('Error fetching email templates:', error.message);
    } else {
        setTemplates(data || []);
    }
  };

  useEffect(() => {
    getTemplates();
    // @ts-ignore
    if (window.lucide) {
      // @ts-ignore
      window.lucide.createIcons();
    }
  }, []); // Only run once on initial load

  useEffect(() => {
    // This effect runs when a template is selected to update the form
    if (selectedTemplate) {
        setEditedSubject(selectedTemplate.subject);
        setEditedBody(selectedTemplate.body);
    } else {
        // Clear the form if no template is selected
        setEditedSubject('');
        setEditedBody('');
    }
  }, [selectedTemplate]);

  const handleSelectTemplate = (template: EmailTemplate) => {
    setSelectedTemplate(template);
  };

  const handleSaveChanges = async () => {
    if (!selectedTemplate) return;

    const { error } = await supabase
      .from('email_templates')
      .update({ subject: editedSubject, body: editedBody })
      .eq('id', selectedTemplate.id);

    if (error) {
        alert(error.message);
    } else {
        alert('Template saved!');
        await getTemplates(); // Refresh the list
    }
  };
  
  const handleDiscardChanges = () => {
    if (!selectedTemplate) return;
    setEditedSubject(selectedTemplate.subject);
    setEditedBody(selectedTemplate.body);
  };

  const handleNewTemplate = async () => {
      const newName = prompt("Enter a name for the new template:");
      if (newName && newName.trim() !== '') {
          const newTemplate = {
              name: newName,
              subject: 'New Template Subject',
              body: 'Write your new template body here...'
          };
          const { error } = await supabase.from('email_templates').insert([newTemplate]);
          if (error) {
            alert(error.message)
          } else {
            await getTemplates(); // Refresh list after creating
          }
      }
  };
  
  const handleDeleteTemplate = async () => {
      if (!selectedTemplate) return;
      if (window.confirm(`Are you sure you want to delete the "${selectedTemplate.name}" template?`)) {
          const { error } = await supabase
            .from('email_templates')
            .delete()
            .eq('id', selectedTemplate.id);

          if (error) {
              alert(error.message);
          } else {
              setSelectedTemplate(null); // Clear selection
              await getTemplates(); // Refresh list
          }
      }
  }

  const isDetailViewVisible = selectedTemplate !== null;

  const renderTemplateList = () => {
    return templates.map(template => (
        <div key={template.id} onClick={() => handleSelectTemplate(template)} 
         className={`p-4 border-l-2 cursor-pointer ${
            selectedTemplate?.id === template.id
              ? 'bg-secondary dark:bg-dark-secondary border-primary'
              : 'border-transparent hover:bg-secondary dark:hover:bg-dark-secondary'
          }`}>
            <p className="font-semibold text-sm">{template.name}</p>
            <p className="text-xs text-muted-foreground dark:text-dark-muted-foreground truncate">{template.subject}</p>
        </div>
    ));
  };
  
  return (
    <div className="h-full p-4 md:p-6">
      <div className="lg:flex h-full bg-card dark:bg-dark-card rounded-lg border border-border dark:border-dark-border overflow-hidden">
        <aside className={`w-full lg:w-1/3 lg:min-w-80 border-r border-border dark:border-dark-border flex-col ${isDetailViewVisible ? 'hidden lg:flex' : 'flex'}`}>
          <div className="p-4 border-b border-border dark:border-dark-border">
              <div className="flex justify-between items-center mb-4">
                  <h2 className="text-lg font-semibold">Email Templates</h2>
                  <button onClick={handleNewTemplate} className="flex items-center bg-primary text-primary-foreground px-3 py-1.5 rounded-md font-medium hover:bg-primary/90 text-sm">
                      <i data-lucide="plus" className="w-4 h-4 mr-2"></i>
                      New Template
                  </button>
              </div>
          </div>
          <div className="flex-1 overflow-y-auto">
            {renderTemplateList()}
          </div>
        </aside>
        <main className={`flex-1 p-6 overflow-y-auto ${isDetailViewVisible ? 'block' : 'hidden lg:block'}`}>
          {selectedTemplate && (
              <>
                <div className="flex justify-between items-center">
                    <button onClick={() => { setSelectedTemplate(null); }} className="lg:hidden flex items-center text-sm font-medium text-muted-foreground dark:text-dark-muted-foreground mb-4">
                        <i data-lucide="arrow-left" className="w-4 h-4 mr-2"></i>
                        Back to list
                    </button>
                    <button onClick={handleDeleteTemplate} className="flex items-center text-sm font-medium text-red-500 hover:text-red-700 mb-4">
                        <i data-lucide="trash-2" className="w-4 h-4 mr-2"></i>
                        Delete Template
                    </button>
                </div>
                <div>
                    <h3 className="text-xl font-bold">{selectedTemplate.name}</h3>
                    <div className="mt-4 py-4 border-b border-border dark:border-dark-border space-y-2">
                        <label htmlFor="subject" className="text-sm font-semibold text-muted-foreground dark:text-dark-muted-foreground">Subject</label>
                        <input
                        id="subject"
                        type="text"
                        value={editedSubject}
                        onChange={(e) => setEditedSubject(e.target.value)}
                        className={inputClasses}
                        />
                    </div>
                    <div className="mt-4 space-y-2">
                        <label htmlFor="body" className="text-sm font-semibold text-muted-foreground dark:text-dark-muted-foreground">Body</label>
                        <textarea
                            id="body"
                            value={editedBody}
                            onChange={(e) => setEditedBody(e.target.value)}
                            rows={10}
                            className={`${inputClasses} font-mono`}
                            placeholder="Template content with {{variables}}"
                        />
                    </div>
                    <div className="mt-6 flex justify-end space-x-3">
                        <button
                            onClick={handleDiscardChanges}
                            className="px-4 py-2 text-sm font-medium rounded-md bg-secondary dark:bg-dark-secondary text-secondary-foreground dark:text-dark-secondary-foreground hover:bg-secondary/80"
                        >
                            Discard Changes
                        </button>
                        <button
                            onClick={handleSaveChanges}
                            className="px-4 py-2 text-sm font-medium rounded-md bg-primary text-primary-foreground hover:bg-primary/90"
                        >
                            Save Template
                        </button>
                    </div>
                </div>
              </>
          )}
          {!selectedTemplate && (
            <div className="hidden lg:flex items-center justify-center h-full text-muted-foreground dark:text-dark-muted-foreground">
              <i data-lucide="file-text" className="w-10 h-10 mr-4"></i>
              <p>Select a template to edit, or create a new one.</p>
            </div>
          )}
        </main>
      </div>
    </div>
  );
};

export default Emails;