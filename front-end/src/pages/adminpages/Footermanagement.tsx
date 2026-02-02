import React, { useState, useEffect } from 'react';
import {
  Plus, Edit2, Trash2, Save, X, Loader, AlertCircle,
  Link as LinkIcon, ExternalLink, ChevronDown, ChevronUp,
  GripVertical, Eye, EyeOff, Settings, BarChart3
} from 'lucide-react';
import { adminService } from '../../services/profileService';
import { useNotification } from './Notificationsystem';

// ─── Types ────────────────────────────────────────────────────────────────

interface FooterLink {
  id: number;
  title: string;
  url: string;
  link_type: 'internal' | 'external';
  open_new_tab: boolean;
  display_order: number;
  active: boolean;
}

interface FooterSection {
  id: number;
  title: string;
  display_order: number;
  active: boolean;
  links: FooterLink[];
  link_count: number;
}

interface FooterSettings {
  id: number;
  copyright_text: string;
  tagline: string;
  show_copyright: boolean;
  show_tagline: boolean;
}

// ─── API Configuration ────────────────────────────────────────────────────

const API_BASE_URL = 'http://127.0.0.1:8000/api/admin/footer';

const getAuthHeaders = () => adminService.getAdminHeaders();

// ─── Section Modal ─────────────────────────────────────────────────────────

const SectionModal: React.FC<{
  section: FooterSection | null;
  onSave: (data: any) => Promise<void>;
  onCancel: () => void;
}> = ({ section, onSave, onCancel }) => {
  const [title, setTitle] = useState(section?.title || '');
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  const handleSave = async () => {
    if (!title.trim()) {
      setError('Section title is required');
      return;
    }

    setSaving(true);
    setError('');

    try {
      await onSave({ title: title.trim() });
    } catch (err: any) {
      setError(err.message);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full">
        <div className="border-b border-gray-200 px-6 py-4 flex items-center justify-between">
          <h3 className="text-lg font-bold text-gray-900">
            {section ? 'Edit Section' : 'New Section'}
          </h3>
          <button onClick={onCancel} className="p-1.5 hover:bg-gray-100 rounded-lg">
            <X className="w-5 h-5 text-gray-400" />
          </button>
        </div>

        <div className="p-6 space-y-4">
          {error && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-3 flex gap-2">
              <AlertCircle className="w-5 h-5 text-red-500 flex-shrink-0" />
              <p className="text-sm text-red-700">{error}</p>
            </div>
          )}

          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Section Title *
            </label>
            <input
              type="text"
              value={title}
              onChange={e => setTitle(e.target.value)}
              placeholder="e.g., Company, Support, Legal"
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-400 focus:border-teal-400"
            />
          </div>
        </div>

        <div className="border-t border-gray-200 px-6 py-4 flex gap-3">
          <button
            onClick={handleSave}
            disabled={saving}
            className="flex-1 flex items-center justify-center gap-2 h-10 bg-gradient-to-r from-teal-500 to-emerald-500 text-white rounded-xl font-semibold hover:opacity-90 transition disabled:opacity-50"
          >
            {saving ? <Loader className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
            {saving ? 'Saving...' : 'Save Section'}
          </button>
          <button
            onClick={onCancel}
            disabled={saving}
            className="px-5 py-2 border border-gray-300 rounded-xl text-sm font-semibold text-gray-600 hover:bg-gray-50 transition disabled:opacity-50"
          >
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
};

// ─── Link Modal ────────────────────────────────────────────────────────────

const LinkModal: React.FC<{
  link: FooterLink | null;
  sectionId: number;
  onSave: (data: any) => Promise<void>;
  onCancel: () => void;
}> = ({ link, sectionId, onSave, onCancel }) => {
  const [title, setTitle] = useState(link?.title || '');
  const [url, setUrl] = useState(link?.url || '');
  const [linkType, setLinkType] = useState<'internal' | 'external'>(link?.link_type || 'internal');
  const [openNewTab, setOpenNewTab] = useState(link?.open_new_tab || false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  const handleSave = async () => {
    if (!title.trim()) {
      setError('Link title is required');
      return;
    }
    if (!url.trim()) {
      setError('URL is required');
      return;
    }

    setSaving(true);
    setError('');

    try {
      await onSave({
        section: sectionId,
        title: title.trim(),
        url: url.trim(),
        link_type: linkType,
        open_new_tab: openNewTab,
      });
    } catch (err: any) {
      setError(err.message);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full">
        <div className="border-b border-gray-200 px-6 py-4 flex items-center justify-between">
          <h3 className="text-lg font-bold text-gray-900">
            {link ? 'Edit Link' : 'New Link'}
          </h3>
          <button onClick={onCancel} className="p-1.5 hover:bg-gray-100 rounded-lg">
            <X className="w-5 h-5 text-gray-400" />
          </button>
        </div>

        <div className="p-6 space-y-4">
          {error && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-3 flex gap-2">
              <AlertCircle className="w-5 h-5 text-red-500 flex-shrink-0" />
              <p className="text-sm text-red-700">{error}</p>
            </div>
          )}

          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Link Title *
            </label>
            <input
              type="text"
              value={title}
              onChange={e => setTitle(e.target.value)}
              placeholder="e.g., About Us, Privacy Policy"
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-400 focus:border-teal-400"
            />
          </div>

          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              URL *
            </label>
            <input
              type="text"
              value={url}
              onChange={e => setUrl(e.target.value)}
              placeholder="/about or https://example.com"
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-400 focus:border-teal-400"
            />
          </div>

          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Link Type
            </label>
            <div className="flex gap-3">
              <button
                type="button"
                onClick={() => setLinkType('internal')}
                className={`flex-1 flex items-center justify-center gap-2 px-4 py-2 rounded-lg border-2 transition ${
                  linkType === 'internal'
                    ? 'border-teal-500 bg-teal-50 text-teal-700'
                    : 'border-gray-200 text-gray-600 hover:border-gray-300'
                }`}
              >
                <LinkIcon className="w-4 h-4" />
                Internal
              </button>
              <button
                type="button"
                onClick={() => setLinkType('external')}
                className={`flex-1 flex items-center justify-center gap-2 px-4 py-2 rounded-lg border-2 transition ${
                  linkType === 'external'
                    ? 'border-teal-500 bg-teal-50 text-teal-700'
                    : 'border-gray-200 text-gray-600 hover:border-gray-300'
                }`}
              >
                <ExternalLink className="w-4 h-4" />
                External
              </button>
            </div>
          </div>

          {linkType === 'external' && (
            <div className="flex items-center gap-2">
              <input
                type="checkbox"
                id="openNewTab"
                checked={openNewTab}
                onChange={e => setOpenNewTab(e.target.checked)}
                className="w-4 h-4 text-teal-500 rounded focus:ring-teal-400"
              />
              <label htmlFor="openNewTab" className="text-sm text-gray-700">
                Open in new tab
              </label>
            </div>
          )}
        </div>

        <div className="border-t border-gray-200 px-6 py-4 flex gap-3">
          <button
            onClick={handleSave}
            disabled={saving}
            className="flex-1 flex items-center justify-center gap-2 h-10 bg-gradient-to-r from-teal-500 to-emerald-500 text-white rounded-xl font-semibold hover:opacity-90 transition disabled:opacity-50"
          >
            {saving ? <Loader className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
            {saving ? 'Saving...' : 'Save Link'}
          </button>
          <button
            onClick={onCancel}
            disabled={saving}
            className="px-5 py-2 border border-gray-300 rounded-xl text-sm font-semibold text-gray-600 hover:bg-gray-50 transition disabled:opacity-50"
          >
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
};

// ─── Settings Modal ────────────────────────────────────────────────────────

const SettingsModal: React.FC<{
  settings: FooterSettings;
  onSave: (data: any) => Promise<void>;
  onCancel: () => void;
}> = ({ settings, onSave, onCancel }) => {
  const [copyrightText, setCopyrightText] = useState(settings.copyright_text);
  const [tagline, setTagline] = useState(settings.tagline);
  const [showCopyright, setShowCopyright] = useState(settings.show_copyright);
  const [showTagline, setShowTagline] = useState(settings.show_tagline);
  const [saving, setSaving] = useState(false);

  const handleSave = async () => {
    setSaving(true);
    try {
      await onSave({
        copyright_text: copyrightText,
        tagline,
        show_copyright: showCopyright,
        show_tagline: showTagline,
      });
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full">
        <div className="border-b border-gray-200 px-6 py-4 flex items-center justify-between">
          <h3 className="text-lg font-bold text-gray-900">Footer Settings</h3>
          <button onClick={onCancel} className="p-1.5 hover:bg-gray-100 rounded-lg">
            <X className="w-5 h-5 text-gray-400" />
          </button>
        </div>

        <div className="p-6 space-y-4">
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Copyright Text
            </label>
            <input
              type="text"
              value={copyrightText}
              onChange={e => setCopyrightText(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-400 focus:border-teal-400"
            />
            <div className="flex items-center gap-2 mt-2">
              <input
                type="checkbox"
                id="showCopyright"
                checked={showCopyright}
                onChange={e => setShowCopyright(e.target.checked)}
                className="w-4 h-4 text-teal-500 rounded focus:ring-teal-400"
              />
              <label htmlFor="showCopyright" className="text-sm text-gray-700">
                Show copyright text
              </label>
            </div>
          </div>

          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Tagline
            </label>
            <input
              type="text"
              value={tagline}
              onChange={e => setTagline(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-400 focus:border-teal-400"
            />
            <div className="flex items-center gap-2 mt-2">
              <input
                type="checkbox"
                id="showTagline"
                checked={showTagline}
                onChange={e => setShowTagline(e.target.checked)}
                className="w-4 h-4 text-teal-500 rounded focus:ring-teal-400"
              />
              <label htmlFor="showTagline" className="text-sm text-gray-700">
                Show tagline
              </label>
            </div>
          </div>
        </div>

        <div className="border-t border-gray-200 px-6 py-4 flex gap-3">
          <button
            onClick={handleSave}
            disabled={saving}
            className="flex-1 flex items-center justify-center gap-2 h-10 bg-gradient-to-r from-teal-500 to-emerald-500 text-white rounded-xl font-semibold hover:opacity-90 transition disabled:opacity-50"
          >
            {saving ? <Loader className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
            {saving ? 'Saving...' : 'Save Settings'}
          </button>
          <button
            onClick={onCancel}
            disabled={saving}
            className="px-5 py-2 border border-gray-300 rounded-xl text-sm font-semibold text-gray-600 hover:bg-gray-50 transition disabled:opacity-50"
          >
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
};

// ─── Section Card ──────────────────────────────────────────────────────────

const SectionCard: React.FC<{
  section: FooterSection;
  onEdit: () => void;
  onDelete: () => void;
  onToggleActive: () => void;
  onAddLink: () => void;
  onEditLink: (link: FooterLink) => void;
  onDeleteLink: (link: FooterLink) => void;
  onToggleLinkActive: (link: FooterLink) => void;
}> = ({ section, onEdit, onDelete, onToggleActive, onAddLink, onEditLink, onDeleteLink, onToggleLinkActive }) => {
  const [expanded, setExpanded] = useState(false);

  return (
    <div className={`bg-white border border-gray-200 rounded-xl overflow-hidden ${!section.active ? 'opacity-60' : ''}`}>
      <div className="flex items-center gap-4 px-5 py-4">
        <GripVertical className="w-5 h-5 text-gray-400 cursor-move" />
        
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2">
            <span className="text-sm font-bold text-gray-900">{section.title}</span>
            {!section.active && (
              <span className="px-2 py-0.5 bg-red-100 text-red-700 text-xs font-semibold rounded-full">
                Inactive
              </span>
            )}
            <span className="px-2 py-0.5 bg-gray-100 text-gray-600 text-xs font-semibold rounded-full">
              {section.link_count} link{section.link_count !== 1 ? 's' : ''}
            </span>
          </div>
        </div>

        <div className="flex items-center gap-1">
          <button
            onClick={() => setExpanded(!expanded)}
            className="p-1.5 text-gray-400 hover:text-teal-600 hover:bg-teal-50 rounded-lg transition"
          >
            {expanded ? <ChevronUp className="w-4.5 h-4.5" /> : <ChevronDown className="w-4.5 h-4.5" />}
          </button>
          <button
            onClick={onEdit}
            className="p-1.5 text-blue-500 hover:bg-blue-50 rounded-lg transition"
          >
            <Edit2 className="w-4 h-4" />
          </button>
          <button
            onClick={onToggleActive}
            className={`p-1.5 rounded-lg transition ${
              section.active ? 'text-amber-500 hover:bg-amber-50' : 'text-green-500 hover:bg-green-50'
            }`}
          >
            {section.active ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
          </button>
          <button
            onClick={onDelete}
            className="p-1.5 text-red-500 hover:bg-red-50 rounded-lg transition"
          >
            <Trash2 className="w-4 h-4" />
          </button>
        </div>
      </div>

      {expanded && (
        <div className="border-t border-gray-100 bg-gray-50 px-5 py-4">
          <div className="flex items-center justify-between mb-3">
            <h4 className="text-sm font-semibold text-gray-700">Links</h4>
            <button
              onClick={onAddLink}
              className="flex items-center gap-1.5 px-3 py-1.5 bg-teal-500 text-white text-xs font-semibold rounded-lg hover:bg-teal-600 transition"
            >
              <Plus className="w-3.5 h-3.5" />
              Add Link
            </button>
          </div>

          {section.links.length === 0 ? (
            <p className="text-sm text-gray-500 text-center py-4">No links yet</p>
          ) : (
            <div className="space-y-2">
              {section.links.map(link => (
                <div
                  key={link.id}
                  className={`flex items-center gap-3 px-3 py-2 bg-white border border-gray-200 rounded-lg ${
                    !link.active ? 'opacity-60' : ''
                  }`}
                >
                  <GripVertical className="w-4 h-4 text-gray-400 cursor-move flex-shrink-0" />
                  
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-medium text-gray-900 truncate">{link.title}</span>
                      {link.link_type === 'external' && (
                        <ExternalLink className="w-3 h-3 text-gray-400 flex-shrink-0" />
                      )}
                      {!link.active && (
                        <span className="px-1.5 py-0.5 bg-red-100 text-red-700 text-xs font-semibold rounded">
                          Hidden
                        </span>
                      )}
                    </div>
                    <p className="text-xs text-gray-500 truncate">{link.url}</p>
                  </div>

                  <div className="flex items-center gap-1 flex-shrink-0">
                    <button
                      onClick={() => onEditLink(link)}
                      className="p-1 text-blue-500 hover:bg-blue-50 rounded transition"
                    >
                      <Edit2 className="w-3.5 h-3.5" />
                    </button>
                    <button
                      onClick={() => onToggleLinkActive(link)}
                      className={`p-1 rounded transition ${
                        link.active ? 'text-amber-500 hover:bg-amber-50' : 'text-green-500 hover:bg-green-50'
                      }`}
                    >
                      {link.active ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                    </button>
                    <button
                      onClick={() => onDeleteLink(link)}
                      className="p-1 text-red-500 hover:bg-red-50 rounded transition"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
};

// ─── Main Component ────────────────────────────────────────────────────────

const FooterManagement: React.FC = () => {
  const { showSuccess, showError, confirm } = useNotification();

  const [sections, setSections] = useState<FooterSection[]>([]);
  const [settings, setSettings] = useState<FooterSettings | null>(null);
  const [loading, setLoading] = useState(true);

  const [sectionModalOpen, setSectionModalOpen] = useState(false);
  const [linkModalOpen, setLinkModalOpen] = useState(false);
  const [settingsModalOpen, setSettingsModalOpen] = useState(false);

  const [editingSection, setEditingSection] = useState<FooterSection | null>(null);
  const [editingLink, setEditingLink] = useState<FooterLink | null>(null);
  const [selectedSectionId, setSelectedSectionId] = useState<number | null>(null);

  // ─── Fetch Data ─────────────────────────────────────────────────────────

  const fetchData = async () => {
    try {
      setLoading(true);

      const [sectionsRes, settingsRes] = await Promise.all([
        fetch(`${API_BASE_URL}/sections/`, { headers: getAuthHeaders() }),
        fetch(`${API_BASE_URL}/settings/`, { headers: getAuthHeaders() }),
      ]);

      if (sectionsRes.ok && settingsRes.ok) {
        const sectionsData = await sectionsRes.json();
        const settingsData = await settingsRes.json();

        setSections(sectionsData);
        setSettings(settingsData);
      }
    } catch (err) {
      showError('Failed to load footer data');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  // ─── Section Handlers ───────────────────────────────────────────────────

  const handleSaveSection = async (data: any) => {
    try {
      const url = editingSection
        ? `${API_BASE_URL}/sections/${editingSection.id}/`
        : `${API_BASE_URL}/sections/`;
      
      const method = editingSection ? 'PATCH' : 'POST';

      const response = await fetch(url, {
        method,
        headers: getAuthHeaders(),
        body: JSON.stringify(data),
      });

      if (response.ok) {
        await fetchData();
        setSectionModalOpen(false);
        setEditingSection(null);
        showSuccess(editingSection ? 'Section updated' : 'Section created');
      }
    } catch (err) {
      throw new Error('Failed to save section');
    }
  };

  const handleDeleteSection = (section: FooterSection) => {
    confirm({
      title: `Delete ${section.title}?`,
      message: 'This will also delete all links in this section.',
      type: 'danger',
      confirmText: 'Delete',
      onConfirm: async () => {
        try {
          const response = await fetch(`${API_BASE_URL}/sections/${section.id}/`, {
            method: 'DELETE',
            headers: getAuthHeaders(),
          });

          if (response.ok || response.status === 204) {
            await fetchData();
            showSuccess('Section deleted');
          }
        } catch (err) {
          showError('Failed to delete section');
        }
      },
    });
  };

  const handleToggleSectionActive = async (section: FooterSection) => {
    try {
      const response = await fetch(`${API_BASE_URL}/sections/${section.id}/toggle_active/`, {
        method: 'POST',
        headers: getAuthHeaders(),
      });

      if (response.ok) {
        await fetchData();
        showSuccess(`Section ${section.active ? 'deactivated' : 'activated'}`);
      }
    } catch (err) {
      showError('Failed to toggle section');
    }
  };

  // ─── Link Handlers ──────────────────────────────────────────────────────

  const handleSaveLink = async (data: any) => {
    try {
      const url = editingLink
        ? `${API_BASE_URL}/links/${editingLink.id}/`
        : `${API_BASE_URL}/links/`;
      
      const method = editingLink ? 'PATCH' : 'POST';

      const response = await fetch(url, {
        method,
        headers: getAuthHeaders(),
        body: JSON.stringify(data),
      });

      if (response.ok) {
        await fetchData();
        setLinkModalOpen(false);
        setEditingLink(null);
        setSelectedSectionId(null);
        showSuccess(editingLink ? 'Link updated' : 'Link created');
      }
    } catch (err) {
      throw new Error('Failed to save link');
    }
  };

  const handleDeleteLink = (link: FooterLink) => {
    confirm({
      title: `Delete ${link.title}?`,
      message: 'This action cannot be undone.',
      type: 'danger',
      confirmText: 'Delete',
      onConfirm: async () => {
        try {
          const response = await fetch(`${API_BASE_URL}/links/${link.id}/`, {
            method: 'DELETE',
            headers: getAuthHeaders(),
          });

          if (response.ok || response.status === 204) {
            await fetchData();
            showSuccess('Link deleted');
          }
        } catch (err) {
          showError('Failed to delete link');
        }
      },
    });
  };

  const handleToggleLinkActive = async (link: FooterLink) => {
    try {
      const response = await fetch(`${API_BASE_URL}/links/${link.id}/toggle_active/`, {
        method: 'POST',
        headers: getAuthHeaders(),
      });

      if (response.ok) {
        await fetchData();
        showSuccess(`Link ${link.active ? 'hidden' : 'shown'}`);
      }
    } catch (err) {
      showError('Failed to toggle link');
    }
  };

  // ─── Settings Handlers ──────────────────────────────────────────────────

  const handleSaveSettings = async (data: any) => {
    try {
      const response = await fetch(`${API_BASE_URL}/settings/1/`, {
        method: 'PATCH',
        headers: getAuthHeaders(),
        body: JSON.stringify(data),
      });

      if (response.ok) {
        await fetchData();
        setSettingsModalOpen(false);
        showSuccess('Settings updated');
      }
    } catch (err) {
      throw new Error('Failed to save settings');
    }
  };

  // ─── Render ─────────────────────────────────────────────────────────────

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <Loader className="w-8 h-8 text-teal-500 animate-spin" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex gap-3">
          <div className="bg-teal-50 rounded-xl px-4 py-2.5">
            <span className="text-xl font-bold text-teal-600">{sections.length}</span>
            <span className="text-xs text-gray-500 font-medium ml-2">Sections</span>
          </div>
        </div>

        <div className="flex gap-2">
          <button
            onClick={() => setSettingsModalOpen(true)}
            className="flex items-center gap-2 px-4 py-2.5 bg-gray-100 text-gray-700 rounded-xl font-semibold hover:bg-gray-200 transition"
          >
            <Settings className="w-4.5 h-4.5" />
            Settings
          </button>
          <button
            onClick={() => {
              setEditingSection(null);
              setSectionModalOpen(true);
            }}
            className="flex items-center gap-2 px-5 py-2.5 bg-gradient-to-r from-teal-500 to-emerald-500 text-white rounded-xl font-semibold hover:opacity-90 transition shadow-sm"
          >
            <Plus className="w-4.5 h-4.5" />
            Add Section
          </button>
        </div>
      </div>

      <div className="space-y-3">
        {sections.length === 0 ? (
          <div className="bg-white border border-gray-200 rounded-xl py-14 text-center">
            <BarChart3 className="w-12 h-12 text-gray-300 mx-auto mb-3" />
            <p className="text-sm text-gray-500">No footer sections yet</p>
          </div>
        ) : (
          sections.map(section => (
            <SectionCard
              key={section.id}
              section={section}
              onEdit={() => {
                setEditingSection(section);
                setSectionModalOpen(true);
              }}
              onDelete={() => handleDeleteSection(section)}
              onToggleActive={() => handleToggleSectionActive(section)}
              onAddLink={() => {
                setSelectedSectionId(section.id);
                setEditingLink(null);
                setLinkModalOpen(true);
              }}
              onEditLink={(link) => {
                setSelectedSectionId(section.id);
                setEditingLink(link);
                setLinkModalOpen(true);
              }}
              onDeleteLink={handleDeleteLink}
              onToggleLinkActive={handleToggleLinkActive}
            />
          ))
        )}
      </div>

      {sectionModalOpen && (
        <SectionModal
          section={editingSection}
          onSave={handleSaveSection}
          onCancel={() => {
            setSectionModalOpen(false);
            setEditingSection(null);
          }}
        />
      )}

      {linkModalOpen && selectedSectionId && (
        <LinkModal
          link={editingLink}
          sectionId={selectedSectionId}
          onSave={handleSaveLink}
          onCancel={() => {
            setLinkModalOpen(false);
            setEditingLink(null);
            setSelectedSectionId(null);
          }}
        />
      )}

      {settingsModalOpen && settings && (
        <SettingsModal
          settings={settings}
          onSave={handleSaveSettings}
          onCancel={() => setSettingsModalOpen(false)}
        />
      )}
    </div>
  );
};

export default FooterManagement;