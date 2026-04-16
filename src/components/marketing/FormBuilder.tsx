"use client";

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Copy, Plus, Trash2, Code, Layout, Settings } from 'lucide-react';
import { toast } from 'sonner';

interface FormField {
  label: string;
  name: string;
  type: 'text' | 'email' | 'tel' | 'textarea';
  required: boolean;
}

export default function FormBuilder({ workspaceId }: { workspaceId: string }) {
  const [name, setName] = useState('New Lead Capture Form');
  const [fields, setFields] = useState<FormField[]>([
    { label: 'First Name', name: 'firstName', type: 'text', required: true },
    { label: 'Email', name: 'email', type: 'email', required: true }
  ]);
  const [showEmbed, setShowEmbed] = useState(false);

  const addField = () => {
    setFields([...fields, { label: 'New Field', name: `field_${fields.length}`, type: 'text', required: false }]);
  };

  const removeField = (index: number) => {
    setFields(fields.filter((_, i) => i !== index));
  };

  const generateEmbedCode = () => {
    const baseUrl = process.env.NEXT_PUBLIC_APP_URL || window.location.origin;
    const jsonFields = JSON.stringify(fields);
    
    return `
<!-- Leadsmind Lead Capture Form -->
<div id="leadsmind-form-container"></div>
<script>
  (function() {
    const config = {
      workspaceId: "${workspaceId}",
      endpoint: "${baseUrl}/api/v1/leads",
      fields: ${jsonFields}
    };
    
    const container = document.getElementById('leadsmind-form-container');
    const form = document.createElement('form');
    form.style.display = 'flex';
    form.style.flexDirection = 'column';
    form.style.gap = '15px';
    form.style.maxWidth = '400px';
    form.style.padding = '20px';
    form.style.border = '1px solid #e2e8f0';
    form.style.borderRadius = '12px';
    form.style.fontFamily = 'sans-serif';

    config.fields.forEach(f => {
      const group = document.createElement('div');
      const label = document.createElement('label');
      label.innerText = f.label;
      label.style.display = 'block';
      label.style.marginBottom = '5px';
      label.style.fontSize = '14px';
      
      const input = f.type === 'textarea' ? document.createElement('textarea') : document.createElement('input');
      input.type = f.type;
      input.name = f.name;
      input.required = f.required;
      input.style.width = '100%';
      input.style.padding = '8px';
      input.style.borderRadius = '6px';
      input.style.border = '1px solid #cbd5e1';
      
      group.appendChild(label);
      group.appendChild(input);
      form.appendChild(group);
    });

    const submit = document.createElement('button');
    submit.innerText = 'Submit';
    submit.style.padding = '10px';
    submit.style.backgroundColor = '#2563eb';
    submit.style.color = 'white';
    submit.style.border = 'none';
    submit.style.borderRadius = '6px';
    submit.style.cursor = 'pointer';
    
    form.appendChild(submit);
    container.appendChild(form);

    form.onsubmit = async (e) => {
      e.preventDefault();
      submit.disabled = true;
      submit.innerText = 'Sending...';
      const formData = new FormData(form);
      const data = Object.fromEntries(formData.entries());
      data.workspaceId = config.workspaceId;

      try {
        const res = await fetch(config.endpoint, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(data)
        });
        if(res.ok) alert('Thank you! Your information has been received.');
        else alert('Something went wrong. Please try again.');
      } catch (err) {
        alert('Error connecting to server.');
      } finally {
        submit.disabled = false;
        submit.innerText = 'Submit';
      }
    };
  })();
</script>
    `.trim();
  };

  const copyToClipboard = () => {
    navigator.clipboard.writeText(generateEmbedCode());
    toast.success('Embed code copied to clipboard!');
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
      <div className="space-y-6">
        <Card className="border-white/5 bg-[#050510]/50 backdrop-blur-xl">
          <CardHeader>
            <CardTitle className="text-lg">Form Configuration</CardTitle>
            <CardDescription>Customize the fields for your lead capture form.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label>Form Name</Label>
              <Input value={name} onChange={(e) => setName(e.target.value)} className="bg-white/5 border-white/10" />
            </div>

            <div className="space-y-4 pt-4">
              <div className="text-xs font-bold uppercase tracking-widest text-white/30">Fields</div>
              {fields.map((field, index) => (
                <div key={index} className="flex gap-2 items-end">
                  <div className="flex-1 space-y-2">
                    <Label className="text-[10px]">Label</Label>
                    <Input 
                      value={field.label} 
                      onChange={(e) => {
                        const newFields = [...fields];
                        newFields[index].label = e.target.value;
                        setFields(newFields);
                      }}
                      className="bg-white/5 border-white/10 h-8 text-xs" 
                    />
                  </div>
                  <div className="w-24 space-y-2">
                    <Label className="text-[10px]">Type</Label>
                    <Input value={field.type} readOnly className="bg-white/5 border-white/10 h-8 text-xs opacity-50" />
                  </div>
                  <Button variant="ghost" size="icon" onClick={() => removeField(index)} className="text-white/20 hover:text-red-500">
                    <Trash2 size={14} />
                  </Button>
                </div>
              ))}
              <Button variant="outline" size="sm" onClick={addField} className="w-full border-dashed border-white/10 bg-white/5 text-xs gap-2">
                <Plus size={14} /> Add Field
              </Button>
            </div>
          </CardContent>
        </Card>

        <Button 
          className="w-full h-12 bg-blue-600 hover:bg-blue-700 text-white rounded-xl gap-2 shadow-lg shadow-blue-600/20"
          onClick={() => setShowEmbed(true)}
        >
          <Code size={18} />
          Generate Embed Code
        </Button>
      </div>

      <div className="space-y-6">
         <Card className="border-white/5 bg-[#050510]/50 backdrop-blur-xl h-full">
            <CardHeader className="flex flex-row items-center justify-between">
              <div>
                <CardTitle className="text-lg">Live Preview</CardTitle>
                <CardDescription>This is how your form will look on your website.</CardDescription>
              </div>
              <Layout size={18} className="text-white/20" />
            </CardHeader>
            <CardContent className="flex items-center justify-center min-h-[300px] border-t border-white/5">
               <div className="w-full max-w-xs p-6 rounded-2xl border border-white/10 bg-white/5 space-y-4">
                  {fields.map((f, i) => (
                    <div key={i} className="space-y-1">
                      <div className="text-[10px] font-bold text-white/40">{f.label}</div>
                      <div className="h-9 w-full rounded-md border border-white/10 bg-white/5" />
                    </div>
                  ))}
                  <div className="h-10 w-full rounded-md bg-blue-600 mt-4" />
               </div>
            </CardContent>
         </Card>
      </div>

      {showEmbed && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
          <Card className="w-full max-w-2xl bg-[#0a0a0f] border-white/10 shadow-2xl">
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle>Embed Your Form</CardTitle>
                <Button variant="ghost" size="icon" onClick={() => setShowEmbed(false)} className="text-white/20">
                  <Plus size={18} className="rotate-45" />
                </Button>
              </div>
              <CardDescription>Copy and paste this code into your website&apos;s HTML where you want the form to appear.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="relative group">
                <pre className="p-4 bg-black rounded-xl border border-white/5 text-[10px] font-mono text-blue-400 overflow-x-auto max-h-[300px]">
                  {generateEmbedCode()}
                </pre>
                <Button 
                  size="sm" 
                  className="absolute top-2 right-2 bg-white/10 hover:bg-white/20 backdrop-blur-md gap-2"
                  onClick={copyToClipboard}
                >
                  <Copy size={14} /> Copy
                </Button>
              </div>
              <div className="p-3 rounded-lg bg-emerald-500/5 border border-emerald-500/10 text-[11px] text-emerald-400/80 leading-relaxed">
                <strong>Note:</strong> Make sure your website domain is allowed under CORS settings if you have restricted access.
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}
