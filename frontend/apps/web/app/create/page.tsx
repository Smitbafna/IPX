'use client';

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Navigation } from '../../components/ipx/Navigation';

interface ProofFile {
  file: File;
  preview?: string;
  status: 'uploading' | 'uploaded' | 'verified' | 'rejected';
}

interface TokenForm {
  title: string;
  description: string;
  ipType: 'Music' | 'Art' | 'Patent' | 'Code' | 'Video' | 'Writing' | '';
  tags: string[];
  royaltyRate: number;
  totalSupply: number;
  initialPrice: number;
  licenseTerms: string;
  expiryDate: string;
}

const ipTypes = [
  { value: 'Music', label: 'Music', emoji: '🎵' },
  { value: 'Art', label: 'Digital Art', emoji: '🎨' },
  { value: 'Patent', label: 'Patent', emoji: '🔬' },
  { value: 'Code', label: 'Source Code', emoji: '💻' },
  { value: 'Video', label: 'Video Content', emoji: '🎬' },
  { value: 'Writing', label: 'Written Work', emoji: '📖' }
];

const licenseTemplates = [
  {
    name: 'Standard Commercial',
    description: 'Standard commercial use with attribution',
    terms: 'This license grants the licensee the right to use, modify, and distribute the intellectual property for commercial purposes with proper attribution to the original creator.'
  },
  {
    name: 'Non-Commercial',
    description: 'Personal and educational use only',
    terms: 'This license permits the licensee to use the intellectual property for non-commercial, educational, or personal purposes only. Commercial use is strictly prohibited.'
  },
  {
    name: 'Exclusive Commercial',
    description: 'Exclusive commercial rights',
    terms: 'This license grants exclusive commercial rights to the licensee, preventing the creator from licensing the same IP to other parties during the license period.'
  },
  {
    name: 'Custom',
    description: 'Create your own license terms',
    terms: ''
  }
];

export default function CreatePage() {
  const [currentStep, setCurrentStep] = useState(1);
  const [proofFiles, setProofFiles] = useState<ProofFile[]>([]);
  const [dragActive, setDragActive] = useState(false);
  const [form, setForm] = useState<TokenForm>({
    title: '',
    description: '',
    ipType: '',
    tags: [],
    royaltyRate: 10,
    totalSupply: 1000,
    initialPrice: 100,
    licenseTerms: '',
    expiryDate: ''
  });
  const [currentTag, setCurrentTag] = useState('');
  const [selectedTemplate, setSelectedTemplate] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitResult, setSubmitResult] = useState<'success' | 'error' | null>(null);

  const steps = [
    { number: 1, title: 'IP Proof Submission', description: 'Upload your intellectual property proof' },
    { number: 2, title: 'Token Details', description: 'Configure your IP token' },
    { number: 3, title: 'Licensing Terms', description: 'Set licensing conditions' },
    { number: 4, title: 'Review & Mint', description: 'Final review and minting' }
  ];

  // File upload handlers
  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true);
    } else if (e.type === 'dragleave') {
      setDragActive(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);

    const files = Array.from(e.dataTransfer.files);
    handleFiles(files);
  };

  const handleFileInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const files = Array.from(e.target.files);
      handleFiles(files);
    }
  };

  const handleFiles = (files: File[]) => {
    const newProofFiles: ProofFile[] = files.map(file => {
      const proofFile: ProofFile = {
        file,
        status: 'uploading'
      };

      // Create preview for images
      if (file.type.startsWith('image/')) {
        const reader = new FileReader();
        reader.onload = (e) => {
          proofFile.preview = e.target?.result as string;
          setProofFiles(prev => [...prev]);
        };
        reader.readAsDataURL(file);
      }

      // Simulate upload
      setTimeout(() => {
        proofFile.status = 'uploaded';
        setProofFiles(prev => [...prev]);
        
        // Simulate verification
        setTimeout(() => {
          proofFile.status = Math.random() > 0.2 ? 'verified' : 'rejected';
          setProofFiles(prev => [...prev]);
        }, 2000);
      }, 1000);

      return proofFile;
    });

    setProofFiles(prev => [...prev, ...newProofFiles]);
  };

  const removeFile = (index: number) => {
    setProofFiles(prev => prev.filter((_, i) => i !== index));
  };

  // Form handlers
  const addTag = () => {
    if (currentTag.trim() && !form.tags.includes(currentTag.trim())) {
      setForm(prev => ({
        ...prev,
        tags: [...prev.tags, currentTag.trim()]
      }));
      setCurrentTag('');
    }
  };

  const removeTag = (tag: string) => {
    setForm(prev => ({
      ...prev,
      tags: prev.tags.filter(t => t !== tag)
    }));
  };

  const handleTemplateSelect = (templateName: string) => {
    setSelectedTemplate(templateName);
    const template = licenseTemplates.find(t => t.name === templateName);
    if (template) {
      setForm(prev => ({ ...prev, licenseTerms: template.terms }));
    }
  };

  const handleSubmit = async () => {
    setIsSubmitting(true);
    
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 3000));
      
      // Mock success/failure
      if (Math.random() > 0.1) {
        setSubmitResult('success');
      } else {
        setSubmitResult('error');
      }
    } catch (error) {
      setSubmitResult('error');
    } finally {
      setIsSubmitting(false);
    }
  };

  const canProceed = (step: number) => {
    switch (step) {
      case 1:
        return proofFiles.some(file => file.status === 'verified');
      case 2:
        return form.title && form.description && form.ipType && form.tags.length > 0;
      case 3:
        return form.licenseTerms.trim().length > 0;
      default:
        return true;
    }
  };

  return (
    <div className="min-h-screen bg-black">
      <Navigation />
      
      <div className="pt-24 pb-20 px-6">
        <div className="container mx-auto max-w-4xl">
          {/* Header */}
          <div className="text-center mb-12">
            <h1 
              className="text-4xl md:text-6xl text-white font-bold mb-4"
              style={{ fontFamily: "Holtwood One SC, serif" }}
            >
              ✨ Create IP Token
            </h1>
            <p className="text-xl text-gray-400">
              Transform your intellectual property into tradeable tokens
            </p>
          </div>

          {/* Progress Steps */}
          <div className="mb-12">
            <div className="flex items-center justify-between mb-4">
              {steps.map((step, index) => (
                <div key={step.number} className="flex items-center">
                  <div className={`flex items-center justify-center w-10 h-10 rounded-full border-2 ${
                    currentStep >= step.number 
                      ? 'bg-purple-600 border-purple-600 text-white' 
                      : 'border-gray-600 text-gray-400'
                  }`}>
                    {currentStep > step.number ? '✓' : step.number}
                  </div>
                  {index < steps.length - 1 && (
                    <div className={`h-0.5 w-16 mx-4 ${
                      currentStep > step.number ? 'bg-purple-600' : 'bg-gray-600'
                    }`} />
                  )}
                </div>
              ))}
            </div>
            <div className="text-center">
              <h2 className="text-2xl text-white font-bold mb-2">
                {steps[currentStep - 1]?.title || 'Step'}
              </h2>
              <p className="text-gray-400">
                {steps[currentStep - 1]?.description || ''}
              </p>
            </div>
          </div>

          {/* Step Content */}
          <div className="bg-gray-900 rounded-2xl border border-gray-700 p-8">
            {/* Step 1: IP Proof Submission */}
            {currentStep === 1 && (
              <div>
                <h3 className="text-xl text-white font-bold mb-6">Upload Your IP Proof</h3>
                
                {/* Upload Area */}
                <div
                  className={`border-2 border-dashed rounded-xl p-12 text-center transition-colors ${
                    dragActive 
                      ? 'border-purple-500 bg-purple-500/10' 
                      : 'border-gray-600 hover:border-gray-500'
                  }`}
                  onDragEnter={handleDrag}
                  onDragLeave={handleDrag}
                  onDragOver={handleDrag}
                  onDrop={handleDrop}
                >
                  <div className="text-6xl mb-4">📄</div>
                  <h4 className="text-xl text-white font-semibold mb-2">
                    Drop your files here or click to browse
                  </h4>
                  <p className="text-gray-400 mb-6">
                    Supported formats: PDF, Images, Audio, Video, Code files
                  </p>
                  <input
                    type="file"
                    multiple
                    onChange={handleFileInput}
                    className="hidden"
                    id="file-upload"
                    accept=".pdf,.jpg,.jpeg,.png,.gif,.mp3,.mp4,.wav,.txt,.js,.py,.sol"
                  />
                  <label
                    htmlFor="file-upload"
                    className="inline-block px-6 py-3 bg-purple-600 hover:bg-purple-700 text-white rounded-xl cursor-pointer transition-colors"
                  >
                    Browse Files
                  </label>
                </div>

                {/* Uploaded Files */}
                {proofFiles.length > 0 && (
                  <div className="mt-8">
                    <h4 className="text-lg text-white font-semibold mb-4">Uploaded Files</h4>
                    <div className="space-y-4">
                      {proofFiles.map((proofFile, index) => (
                        <div key={index} className="flex items-center gap-4 p-4 bg-gray-800 rounded-xl">
                          {proofFile.preview && (
                            <img 
                              src={proofFile.preview} 
                              alt="Preview" 
                              className="w-16 h-16 object-cover rounded-lg"
                            />
                          )}
                          <div className="flex-1">
                            <div className="text-white font-medium">{proofFile.file.name}</div>
                            <div className="text-sm text-gray-400">
                              {(proofFile.file.size / (1024 * 1024)).toFixed(2)} MB
                            </div>
                          </div>
                          <div className="flex items-center gap-2">
                            <div className={`px-3 py-1 rounded-full text-xs ${
                              proofFile.status === 'uploading' ? 'bg-yellow-500 text-yellow-900' :
                              proofFile.status === 'uploaded' ? 'bg-blue-500 text-blue-900' :
                              proofFile.status === 'verified' ? 'bg-green-500 text-green-900' :
                              'bg-red-500 text-red-900'
                            }`}>
                              {proofFile.status === 'uploading' && '⏳ Uploading'}
                              {proofFile.status === 'uploaded' && '📤 Uploaded'}
                              {proofFile.status === 'verified' && '✅ Verified'}
                              {proofFile.status === 'rejected' && '❌ Rejected'}
                            </div>
                            <button
                              onClick={() => removeFile(index)}
                              className="text-red-400 hover:text-red-300 text-xl"
                            >
                              ×
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* Step 2: Token Details */}
            {currentStep === 2 && (
              <div>
                <h3 className="text-xl text-white font-bold mb-6">Configure Your IP Token</h3>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* Title */}
                  <div className="md:col-span-2">
                    <label className="block text-white font-medium mb-2">Token Title</label>
                    <input
                      type="text"
                      value={form.title}
                      onChange={(e) => setForm(prev => ({ ...prev, title: e.target.value }))}
                      placeholder="Enter a descriptive title for your IP token"
                      className="w-full px-4 py-3 bg-gray-800 border border-gray-600 rounded-xl text-white placeholder-gray-400 focus:border-purple-500 focus:outline-none"
                    />
                  </div>

                  {/* Description */}
                  <div className="md:col-span-2">
                    <label className="block text-white font-medium mb-2">Description</label>
                    <textarea
                      value={form.description}
                      onChange={(e) => setForm(prev => ({ ...prev, description: e.target.value }))}
                      placeholder="Describe your intellectual property, its uniqueness, and potential value"
                      rows={4}
                      className="w-full px-4 py-3 bg-gray-800 border border-gray-600 rounded-xl text-white placeholder-gray-400 focus:border-purple-500 focus:outline-none resize-none"
                    />
                  </div>

                  {/* IP Type */}
                  <div>
                    <label className="block text-white font-medium mb-2">IP Type</label>
                    <select
                      value={form.ipType}
                      onChange={(e) => setForm(prev => ({ ...prev, ipType: e.target.value as any }))}
                      className="w-full px-4 py-3 bg-gray-800 border border-gray-600 rounded-xl text-white focus:border-purple-500 focus:outline-none"
                    >
                      <option value="">Select IP Type</option>
                      {ipTypes.map(type => (
                        <option key={type.value} value={type.value}>
                          {type.emoji} {type.label}
                        </option>
                      ))}
                    </select>
                  </div>

                  {/* Royalty Rate */}
                  <div>
                    <label className="block text-white font-medium mb-2">
                      Royalty Rate: {form.royaltyRate}%
                    </label>
                    <input
                      type="range"
                      min="1"
                      max="25"
                      value={form.royaltyRate}
                      onChange={(e) => setForm(prev => ({ ...prev, royaltyRate: parseInt(e.target.value) }))}
                      className="w-full"
                    />
                    <div className="flex justify-between text-xs text-gray-400 mt-1">
                      <span>1%</span>
                      <span>25%</span>
                    </div>
                  </div>

                  {/* Total Supply */}
                  <div>
                    <label className="block text-white font-medium mb-2">Total Supply</label>
                    <input
                      type="number"
                      value={form.totalSupply}
                      onChange={(e) => setForm(prev => ({ ...prev, totalSupply: parseInt(e.target.value) || 0 }))}
                      min="1"
                      className="w-full px-4 py-3 bg-gray-800 border border-gray-600 rounded-xl text-white focus:border-purple-500 focus:outline-none"
                    />
                  </div>

                  {/* Initial Price */}
                  <div>
                    <label className="block text-white font-medium mb-2">Initial Price (HBAR)</label>
                    <input
                      type="number"
                      value={form.initialPrice}
                      onChange={(e) => setForm(prev => ({ ...prev, initialPrice: parseFloat(e.target.value) || 0 }))}
                      min="0"
                      step="0.01"
                      className="w-full px-4 py-3 bg-gray-800 border border-gray-600 rounded-xl text-white focus:border-purple-500 focus:outline-none"
                    />
                  </div>

                  {/* Tags */}
                  <div className="md:col-span-2">
                    <label className="block text-white font-medium mb-2">Tags</label>
                    <div className="flex gap-2 mb-3">
                      <input
                        type="text"
                        value={currentTag}
                        onChange={(e) => setCurrentTag(e.target.value)}
                        onKeyPress={(e) => e.key === 'Enter' && addTag()}
                        placeholder="Add tags (e.g., music, rock, instrumental)"
                        className="flex-1 px-4 py-2 bg-gray-800 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:border-purple-500 focus:outline-none"
                      />
                      <button
                        onClick={addTag}
                        className="px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-lg transition-colors"
                      >
                        Add
                      </button>
                    </div>
                    <div className="flex flex-wrap gap-2">
                      {form.tags.map(tag => (
                        <span
                          key={tag}
                          className="px-3 py-1 bg-gray-700 text-white rounded-full text-sm flex items-center gap-2"
                        >
                          {tag}
                          <button
                            onClick={() => removeTag(tag)}
                            className="text-red-400 hover:text-red-300"
                          >
                            ×
                          </button>
                        </span>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Step 3: Licensing Terms */}
            {currentStep === 3 && (
              <div>
                <h3 className="text-xl text-white font-bold mb-6">Set Licensing Terms</h3>
                
                {/* License Templates */}
                <div className="mb-6">
                  <label className="block text-white font-medium mb-4">Choose a license template</label>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {licenseTemplates.map(template => (
                      <button
                        key={template.name}
                        onClick={() => handleTemplateSelect(template.name)}
                        className={`p-4 border-2 rounded-xl text-left transition-colors ${
                          selectedTemplate === template.name
                            ? 'border-purple-500 bg-purple-500/10'
                            : 'border-gray-600 hover:border-gray-500'
                        }`}
                      >
                        <h4 className="text-white font-semibold mb-2">{template.name}</h4>
                        <p className="text-gray-400 text-sm">{template.description}</p>
                      </button>
                    ))}
                  </div>
                </div>

                {/* Custom License Terms */}
                <div>
                  <label className="block text-white font-medium mb-2">License Terms</label>
                  <textarea
                    value={form.licenseTerms}
                    onChange={(e) => setForm(prev => ({ ...prev, licenseTerms: e.target.value }))}
                    placeholder="Enter your custom license terms or modify the selected template"
                    rows={8}
                    className="w-full px-4 py-3 bg-gray-800 border border-gray-600 rounded-xl text-white placeholder-gray-400 focus:border-purple-500 focus:outline-none resize-none"
                  />
                </div>

                {/* Expiry Date */}
                <div className="mt-6">
                  <label className="block text-white font-medium mb-2">License Expiry (Optional)</label>
                  <input
                    type="date"
                    value={form.expiryDate}
                    onChange={(e) => setForm(prev => ({ ...prev, expiryDate: e.target.value }))}
                    className="px-4 py-3 bg-gray-800 border border-gray-600 rounded-xl text-white focus:border-purple-500 focus:outline-none"
                  />
                  <p className="text-gray-400 text-sm mt-2">
                    Leave empty for perpetual licensing
                  </p>
                </div>
              </div>
            )}

            {/* Step 4: Review & Mint */}
            {currentStep === 4 && (
              <div>
                <h3 className="text-xl text-white font-bold mb-6">Review & Mint Token</h3>
                
                <div className="space-y-6">
                  {/* Token Summary */}
                  <div className="bg-gray-800 rounded-xl p-6">
                    <h4 className="text-lg text-white font-semibold mb-4">Token Summary</h4>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <span className="text-gray-400">Title:</span>
                        <span className="text-white ml-2">{form.title}</span>
                      </div>
                      <div>
                        <span className="text-gray-400">Type:</span>
                        <span className="text-white ml-2">{form.ipType}</span>
                      </div>
                      <div>
                        <span className="text-gray-400">Royalty Rate:</span>
                        <span className="text-white ml-2">{form.royaltyRate}%</span>
                      </div>
                      <div>
                        <span className="text-gray-400">Total Supply:</span>
                        <span className="text-white ml-2">{form.totalSupply}</span>
                      </div>
                      <div>
                        <span className="text-gray-400">Initial Price:</span>
                        <span className="text-white ml-2">{form.initialPrice} HBAR</span>
                      </div>
                      <div>
                        <span className="text-gray-400">Verified Files:</span>
                        <span className="text-white ml-2">{proofFiles.filter(f => f.status === 'verified').length}</span>
                      </div>
                    </div>
                  </div>

                  {/* Estimated Costs */}
                  <div className="bg-gray-800 rounded-xl p-6">
                    <h4 className="text-lg text-white font-semibold mb-4">Estimated Costs</h4>
                    <div className="space-y-2">
                      <div className="flex justify-between">
                        <span className="text-gray-400">Proof Verification Fee:</span>
                        <span className="text-white">10 HBAR</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-400">Token Minting Fee:</span>
                        <span className="text-white">25 HBAR</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-400">Platform Fee:</span>
                        <span className="text-white">5 HBAR</span>
                      </div>
                      <hr className="border-gray-600" />
                      <div className="flex justify-between font-bold">
                        <span className="text-white">Total:</span>
                        <span className="text-white">40 HBAR</span>
                      </div>
                    </div>
                  </div>

                  {/* Minting Button */}
                  <div className="text-center">
                    {submitResult === 'success' ? (
                      <div className="text-center py-8">
                        <div className="text-6xl mb-4">🎉</div>
                        <h3 className="text-2xl text-white font-bold mb-2">Token Minted Successfully!</h3>
                        <p className="text-gray-400 mb-6">Your IP token has been created and is now available in your portfolio.</p>
                        <button
                          onClick={() => window.open('/portfolio', '_self')}
                          className="px-8 py-3 bg-purple-600 hover:bg-purple-700 text-white font-bold rounded-xl transition-colors"
                        >
                          View in Portfolio
                        </button>
                      </div>
                    ) : submitResult === 'error' ? (
                      <div className="text-center py-8">
                        <div className="text-6xl mb-4">❌</div>
                        <h3 className="text-2xl text-white font-bold mb-2">Minting Failed</h3>
                        <p className="text-gray-400 mb-6">There was an error minting your token. Please try again.</p>
                        <button
                          onClick={() => setSubmitResult(null)}
                          className="px-8 py-3 bg-red-600 hover:bg-red-700 text-white font-bold rounded-xl transition-colors"
                        >
                          Try Again
                        </button>
                      </div>
                    ) : (
                      <button
                        onClick={handleSubmit}
                        disabled={isSubmitting}
                        className={`px-12 py-4 text-white font-bold rounded-xl transition-all duration-300 ${
                          isSubmitting
                            ? 'bg-gray-600 cursor-not-allowed'
                            : 'bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 shadow-lg hover:shadow-xl'
                        }`}
                        style={{ fontFamily: "Holtwood One SC, serif" }}
                      >
                        {isSubmitting ? (
                          <div className="flex items-center gap-3">
                            <div className="w-6 h-6 border-2 border-white border-t-transparent rounded-full animate-spin" />
                            Minting Token...
                          </div>
                        ) : (
                          '✨ Mint IP Token'
                        )}
                      </button>
                    )}
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Navigation Buttons */}
          {!submitResult && (
            <div className="flex justify-between mt-8">
              <button
                onClick={() => setCurrentStep(prev => Math.max(1, prev - 1))}
                disabled={currentStep === 1}
                className="px-6 py-3 bg-gray-700 hover:bg-gray-600 text-white rounded-xl disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                ← Previous
              </button>

              <button
                onClick={() => setCurrentStep(prev => Math.min(4, prev + 1))}
                disabled={currentStep === 4 || !canProceed(currentStep)}
                className="px-6 py-3 bg-purple-600 hover:bg-purple-700 text-white rounded-xl disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                Next →
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
