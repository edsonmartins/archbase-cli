"use strict";
/**
 * KnowledgeBase - Central knowledge management for Archbase components
 *
 * This class manages the knowledge about components, patterns, and examples.
 * It supports both auto-generated (via AST analysis) and manually curated information.
 */
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
exports.KnowledgeBase = void 0;
const fs = __importStar(require("fs-extra"));
const path = __importStar(require("path"));
class KnowledgeBase {
    constructor(knowledgePath = path.join(__dirname, '../../knowledge')) {
        this.componentsCache = new Map();
        this.patternsCache = [];
        this.knowledgePath = knowledgePath;
    }
    async initialize() {
        await this.loadComponents();
        await this.loadPatterns();
    }
    async getComponent(name) {
        if (!this.componentsCache.has(name)) {
            await this.loadComponents();
        }
        const component = this.componentsCache.get(name);
        if (!component) {
            // Try case-insensitive search
            const keys = Array.from(this.componentsCache.keys());
            const found = keys.find(key => key.toLowerCase() === name.toLowerCase());
            return found ? this.componentsCache.get(found) || null : null;
        }
        return component;
    }
    async searchPatterns(description, category) {
        if (this.patternsCache.length === 0) {
            await this.loadPatterns();
        }
        const searchTerms = description.toLowerCase().split(' ');
        return this.patternsCache.filter(pattern => {
            if (category && !pattern.tags.includes(category)) {
                return false;
            }
            const searchText = `${pattern.title} ${pattern.description} ${pattern.tags.join(' ')}`.toLowerCase();
            return searchTerms.some(term => searchText.includes(term));
        });
    }
    async searchExamples(filters) {
        const examples = [];
        // Collect examples from components
        for (const component of this.componentsCache.values()) {
            const filtered = component.examples.filter(example => {
                if (filters.component && component.name !== filters.component)
                    return false;
                if (filters.tag && !example.tags.includes(filters.tag))
                    return false;
                return true;
            });
            examples.push(...filtered);
        }
        // TODO: Add pattern-based examples
        return examples;
    }
    async freeSearch(query) {
        const searchTerms = query.toLowerCase().split(' ');
        // Search components
        const components = Array.from(this.componentsCache.values()).filter(component => {
            const searchText = `${component.name} ${component.description} ${component.useCases.join(' ')}`.toLowerCase();
            return searchTerms.some(term => searchText.includes(term));
        });
        // Search patterns
        const patterns = await this.searchPatterns(query);
        // Search examples
        const examples = await this.searchExamples({});
        const filteredExamples = examples.filter(example => {
            const searchText = `${example.title} ${example.description} ${example.tags.join(' ')}`.toLowerCase();
            return searchTerms.some(term => searchText.includes(term));
        });
        return {
            components,
            patterns,
            examples: filteredExamples
        };
    }
    async loadComponents() {
        try {
            const componentsFile = path.join(this.knowledgePath, 'components.json');
            if (await fs.pathExists(componentsFile)) {
                const data = await fs.readJson(componentsFile);
                if (data.components) {
                    Object.entries(data.components).forEach(([name, info]) => {
                        this.componentsCache.set(name, info);
                    });
                }
            }
            else {
                // Initialize with default Archbase React components
                await this.initializeDefaultComponents();
            }
        }
        catch (error) {
            console.warn('Failed to load components knowledge base:', error.message);
            await this.initializeDefaultComponents();
        }
    }
    async loadPatterns() {
        try {
            const patternsFile = path.join(this.knowledgePath, 'patterns.json');
            if (await fs.pathExists(patternsFile)) {
                const data = await fs.readJson(patternsFile);
                if (data.patterns) {
                    this.patternsCache = Object.values(data.patterns);
                }
            }
            else {
                await this.initializeDefaultPatterns();
            }
        }
        catch (error) {
            console.warn('Failed to load patterns knowledge base:', error.message);
            await this.initializeDefaultPatterns();
        }
    }
    async initializeDefaultComponents() {
        // Initialize with key Archbase React components
        const defaultComponents = {
            'ArchbaseEdit': {
                name: 'ArchbaseEdit',
                description: 'Text input component with DataSource integration',
                category: 'editors',
                version: '2.1.4',
                status: 'stable',
                props: {
                    dataSource: { type: 'ArchbaseDataSource<T, ID>', required: false, description: 'DataSource for data binding' },
                    dataField: { type: 'string', required: false, description: 'Field name for data binding' },
                    label: { type: 'string', required: false, description: 'Input label' },
                    placeholder: { type: 'string', required: false, description: 'Placeholder text' },
                    disabled: { type: 'boolean', required: false, description: 'Disable input', defaultValue: false },
                    readOnly: { type: 'boolean', required: false, description: 'Read-only mode', defaultValue: false }
                },
                examples: [
                    {
                        title: 'Basic text input',
                        description: 'Simple text input with label',
                        file: 'examples/basic-edit.tsx',
                        tags: ['basic', 'form']
                    }
                ],
                patterns: [],
                relatedComponents: ['ArchbaseTextArea', 'ArchbasePasswordEdit'],
                dependencies: ['@archbase/react'],
                complexity: 'low',
                useCases: ['forms', 'data entry', 'user input'],
                aiHints: [
                    'Always include onChangeValue handler for external state updates',
                    'Use dataSource for automatic data binding',
                    'Consider validation for user input forms'
                ]
            },
            'ArchbaseDataTable': {
                name: 'ArchbaseDataTable',
                description: 'Advanced data table with sorting, filtering, and pagination',
                category: 'tables',
                version: '2.1.4',
                status: 'stable',
                props: {
                    dataSource: { type: 'ArchbaseDataSource<T, ID>', required: true, description: 'DataSource for table data' },
                    columns: { type: 'ColumnDef[]', required: true, description: 'Table column definitions' },
                    enableSorting: { type: 'boolean', required: false, description: 'Enable column sorting', defaultValue: true },
                    enableFiltering: { type: 'boolean', required: false, description: 'Enable column filtering', defaultValue: true }
                },
                examples: [
                    {
                        title: 'Data table with filtering',
                        description: 'Table with search and column filters',
                        file: 'examples/filtered-table.tsx',
                        tags: ['table', 'filtering', 'search']
                    }
                ],
                patterns: [],
                relatedComponents: ['ArchbaseList', 'ArchbasePagination'],
                dependencies: ['@archbase/react', '@tanstack/react-table'],
                complexity: 'medium',
                useCases: ['data display', 'admin panels', 'search results'],
                aiHints: [
                    'Define columns with proper type safety',
                    'Use enableFiltering for searchable tables',
                    'Consider pagination for large datasets'
                ]
            },
            'ArchbaseFormTemplate': {
                name: 'ArchbaseFormTemplate',
                description: 'Template-based form component with DataSource V2 integration',
                category: 'forms',
                version: '2.1.4',
                status: 'stable',
                props: {
                    dataSource: { type: 'ArchbaseRemoteDataSource<T, ID>', required: true, description: 'DataSource V2 for form data' },
                    validator: { type: 'ArchbaseValidator', required: false, description: 'Form validation' },
                    onSaveComplete: { type: '(record: T) => void', required: false, description: 'Save completion callback' },
                    onError: { type: '(error: any) => void', required: false, description: 'Error handling callback' },
                    children: { type: 'ReactNode', required: true, description: 'Form field components' }
                },
                examples: [
                    {
                        title: 'User form with DataSource V2',
                        description: 'Complete form using real powerview-admin pattern',
                        file: 'examples/form-template-v2.tsx',
                        tags: ['form', 'datasource-v2', 'validation']
                    }
                ],
                patterns: [],
                relatedComponents: ['ArchbaseEdit', 'ArchbaseSelect', 'ArchbaseButton', 'useArchbaseRemoteDataSource'],
                dependencies: ['@archbase/react'],
                complexity: 'medium',
                useCases: ['forms', 'data entry', 'CRUD operations', 'admin panels'],
                aiHints: [
                    'Use with useArchbaseRemoteDataSource hook for V2 integration',
                    'Wrap form fields as children',
                    'Handle validation with ArchbaseValidator',
                    'Ideal for admin CRUD forms'
                ]
            },
            'ArchbaseDataGrid': {
                name: 'ArchbaseDataGrid',
                description: 'Advanced data grid with CRUD operations, filtering, and permissions',
                category: 'grids',
                version: '2.1.4',
                status: 'stable',
                props: {
                    dataSource: { type: 'ArchbaseRemoteDataSource<T, ID>', required: true, description: 'DataSource for grid data' },
                    children: { type: 'ReactNode', required: true, description: 'Column definitions' },
                    enableRowActions: { type: 'boolean', required: false, description: 'Enable row action buttons', defaultValue: false },
                    renderRowActions: { type: '(row: T) => ReactNode', required: false, description: 'Custom row actions renderer' },
                    toolbarLeftContent: { type: 'ReactNode', required: false, description: 'Toolbar left side content' },
                    withBorder: { type: 'boolean', required: false, description: 'Show grid border', defaultValue: true },
                    striped: { type: 'boolean', required: false, description: 'Striped row styling', defaultValue: false },
                    pageSize: { type: 'number', required: false, description: 'Number of rows per page', defaultValue: 25 }
                },
                examples: [
                    {
                        title: 'CRUD grid with permissions',
                        description: 'Complete grid following powerview-admin pattern',
                        file: 'examples/data-grid-crud.tsx',
                        tags: ['grid', 'crud', 'permissions', 'admin']
                    }
                ],
                patterns: [],
                relatedComponents: ['ArchbaseDataGridColumn', 'useArchbaseRemoteDataSource'],
                dependencies: ['@archbase/react'],
                complexity: 'medium',
                useCases: ['data display', 'admin panels', 'CRUD lists', 'search results'],
                aiHints: [
                    'Use ArchbaseDataGridColumn children for column definitions',
                    'Enable row actions for CRUD operations',
                    'Use toolbar for add/edit/delete buttons',
                    'Perfect for admin list views'
                ]
            },
            'ArchbaseSelect': {
                name: 'ArchbaseSelect',
                description: 'Dropdown select component with DataSource integration',
                category: 'editors',
                version: '2.1.4',
                status: 'stable',
                props: {
                    dataSource: { type: 'ArchbaseDataSource<T, ID>', required: false, description: 'DataSource for data binding' },
                    dataField: { type: 'string', required: false, description: 'Field name for data binding' },
                    data: { type: 'any[]', required: false, description: 'Static data array for options' },
                    getOptionLabel: { type: '(option: any) => string', required: false, description: 'Label extraction function' },
                    getOptionValue: { type: '(option: any) => any', required: false, description: 'Value extraction function' },
                    placeholder: { type: 'string', required: false, description: 'Placeholder text' },
                    searchable: { type: 'boolean', required: false, description: 'Enable search functionality', defaultValue: false },
                    disabled: { type: 'boolean', required: false, description: 'Disable select', defaultValue: false }
                },
                examples: [
                    {
                        title: 'Status select with enum values',
                        description: 'Select using enum values for status fields',
                        file: 'examples/select-enum.tsx',
                        tags: ['select', 'enum', 'status']
                    }
                ],
                patterns: [],
                relatedComponents: ['ArchbaseEdit', 'ArchbaseMultiSelect'],
                dependencies: ['@archbase/react'],
                complexity: 'low',
                useCases: ['forms', 'filters', 'status selection', 'category selection'],
                aiHints: [
                    'Use data prop for static options',
                    'Use getOptionLabel/getOptionValue for object arrays',
                    'Enable searchable for large option lists',
                    'Perfect for enum and status fields'
                ]
            },
            'ArchbaseButton': {
                name: 'ArchbaseButton',
                description: 'Enhanced button component with loading states and variants',
                category: 'actions',
                version: '2.1.4',
                status: 'stable',
                props: {
                    children: { type: 'ReactNode', required: true, description: 'Button content' },
                    variant: { type: 'filled | outline | light | subtle', required: false, description: 'Button variant', defaultValue: 'filled' },
                    color: { type: 'string', required: false, description: 'Button color theme', defaultValue: 'blue' },
                    size: { type: 'xs | sm | md | lg | xl', required: false, description: 'Button size', defaultValue: 'md' },
                    loading: { type: 'boolean', required: false, description: 'Loading state', defaultValue: false },
                    disabled: { type: 'boolean', required: false, description: 'Disabled state', defaultValue: false },
                    leftSection: { type: 'ReactNode', required: false, description: 'Left icon or content' },
                    rightSection: { type: 'ReactNode', required: false, description: 'Right icon or content' },
                    onClick: { type: '() => void', required: false, description: 'Click handler' }
                },
                examples: [
                    {
                        title: 'Button with loading state',
                        description: 'Submit button with loading indicator',
                        file: 'examples/button-loading.tsx',
                        tags: ['button', 'loading', 'submit']
                    }
                ],
                patterns: [],
                relatedComponents: ['ArchbaseActionIcon', 'ArchbaseButtonGroup'],
                dependencies: ['@archbase/react'],
                complexity: 'low',
                useCases: ['forms', 'actions', 'navigation', 'toolbars'],
                aiHints: [
                    'Use loading prop for async operations',
                    'Use leftSection/rightSection for icons',
                    'Choose appropriate variant for context',
                    'Essential for form submissions and actions'
                ]
            },
            'ArchbaseTextArea': {
                name: 'ArchbaseTextArea',
                description: 'Multi-line text input component with DataSource integration',
                category: 'editors',
                version: '2.1.4',
                status: 'stable',
                props: {
                    dataSource: { type: 'ArchbaseDataSource<T, ID>', required: false, description: 'DataSource for data binding' },
                    dataField: { type: 'string', required: false, description: 'Field name for data binding' },
                    label: { type: 'string', required: false, description: 'Input label' },
                    placeholder: { type: 'string', required: false, description: 'Placeholder text' },
                    rows: { type: 'number', required: false, description: 'Number of visible rows', defaultValue: 3 },
                    autosize: { type: 'boolean', required: false, description: 'Auto-resize height', defaultValue: false },
                    disabled: { type: 'boolean', required: false, description: 'Disable input', defaultValue: false },
                    readOnly: { type: 'boolean', required: false, description: 'Read-only mode', defaultValue: false }
                },
                examples: [
                    {
                        title: 'Auto-resizing description field',
                        description: 'TextArea that grows with content',
                        file: 'examples/textarea-autosize.tsx',
                        tags: ['textarea', 'autosize', 'description']
                    }
                ],
                patterns: [],
                relatedComponents: ['ArchbaseEdit', 'ArchbaseRichTextEditor'],
                dependencies: ['@archbase/react'],
                complexity: 'low',
                useCases: ['forms', 'comments', 'descriptions', 'notes'],
                aiHints: [
                    'Use autosize for dynamic content',
                    'Set appropriate rows for initial height',
                    'Perfect for description and comment fields',
                    'Consider maxLength for validation'
                ]
            },
            'ArchbaseCheckbox': {
                name: 'ArchbaseCheckbox',
                description: 'Checkbox component with DataSource integration',
                category: 'editors',
                version: '2.1.4',
                status: 'stable',
                props: {
                    dataSource: { type: 'ArchbaseDataSource<T, ID>', required: false, description: 'DataSource for data binding' },
                    dataField: { type: 'string', required: false, description: 'Field name for data binding' },
                    label: { type: 'string', required: false, description: 'Checkbox label' },
                    description: { type: 'string', required: false, description: 'Helper description' },
                    disabled: { type: 'boolean', required: false, description: 'Disable checkbox', defaultValue: false },
                    indeterminate: { type: 'boolean', required: false, description: 'Indeterminate state', defaultValue: false },
                    color: { type: 'string', required: false, description: 'Checkbox color theme', defaultValue: 'blue' }
                },
                examples: [
                    {
                        title: 'Terms agreement checkbox',
                        description: 'Checkbox for terms and conditions',
                        file: 'examples/checkbox-terms.tsx',
                        tags: ['checkbox', 'terms', 'agreement']
                    }
                ],
                patterns: [],
                relatedComponents: ['ArchbaseCheckboxGroup', 'ArchbaseSwitch'],
                dependencies: ['@archbase/react'],
                complexity: 'low',
                useCases: ['forms', 'settings', 'agreements', 'boolean fields'],
                aiHints: [
                    'Use for boolean data fields',
                    'Include descriptive labels',
                    'Perfect for settings and preferences',
                    'Use indeterminate for partial states'
                ]
            },
            'ArchbaseRadio': {
                name: 'ArchbaseRadio',
                description: 'Radio button group component with DataSource integration',
                category: 'editors',
                version: '2.1.4',
                status: 'stable',
                props: {
                    dataSource: { type: 'ArchbaseDataSource<T, ID>', required: false, description: 'DataSource for data binding' },
                    dataField: { type: 'string', required: false, description: 'Field name for data binding' },
                    data: { type: 'any[]', required: true, description: 'Array of radio options' },
                    getOptionLabel: { type: '(option: any) => string', required: false, description: 'Label extraction function' },
                    getOptionValue: { type: '(option: any) => any', required: false, description: 'Value extraction function' },
                    orientation: { type: 'horizontal | vertical', required: false, description: 'Radio group orientation', defaultValue: 'vertical' },
                    disabled: { type: 'boolean', required: false, description: 'Disable all options', defaultValue: false }
                },
                examples: [
                    {
                        title: 'Priority selection radio',
                        description: 'Radio group for priority levels',
                        file: 'examples/radio-priority.tsx',
                        tags: ['radio', 'priority', 'selection']
                    }
                ],
                patterns: [],
                relatedComponents: ['ArchbaseSelect', 'ArchbaseSegmentedControl'],
                dependencies: ['@archbase/react'],
                complexity: 'low',
                useCases: ['forms', 'selections', 'categories', 'priorities'],
                aiHints: [
                    'Use for mutually exclusive options',
                    'Better than select for few options',
                    'Use horizontal orientation for space',
                    'Perfect for priority and category fields'
                ]
            },
            'ArchbaseDate': {
                name: 'ArchbaseDate',
                description: 'Date picker component with DataSource integration',
                category: 'editors',
                version: '2.1.4',
                status: 'stable',
                props: {
                    dataSource: { type: 'ArchbaseDataSource<T, ID>', required: false, description: 'DataSource for data binding' },
                    dataField: { type: 'string', required: false, description: 'Field name for data binding' },
                    label: { type: 'string', required: false, description: 'Input label' },
                    placeholder: { type: 'string', required: false, description: 'Placeholder text' },
                    format: { type: 'string', required: false, description: 'Date format string', defaultValue: 'DD/MM/YYYY' },
                    clearable: { type: 'boolean', required: false, description: 'Show clear button', defaultValue: true },
                    disabled: { type: 'boolean', required: false, description: 'Disable input', defaultValue: false },
                    minDate: { type: 'Date', required: false, description: 'Minimum selectable date' },
                    maxDate: { type: 'Date', required: false, description: 'Maximum selectable date' }
                },
                examples: [
                    {
                        title: 'Birth date picker',
                        description: 'Date picker with max date validation',
                        file: 'examples/date-birth.tsx',
                        tags: ['date', 'birth', 'validation']
                    }
                ],
                patterns: [],
                relatedComponents: ['ArchbaseDateTime', 'ArchbaseDateRange'],
                dependencies: ['@archbase/react'],
                complexity: 'low',
                useCases: ['forms', 'date selection', 'scheduling', 'filtering'],
                aiHints: [
                    'Use format prop for localization',
                    'Set minDate/maxDate for validation',
                    'Enable clearable for optional dates',
                    'Essential for date-based forms'
                ]
            },
            'ArchbaseNumber': {
                name: 'ArchbaseNumber',
                description: 'Numeric input component with DataSource integration',
                category: 'editors',
                version: '2.1.4',
                status: 'stable',
                props: {
                    dataSource: { type: 'ArchbaseDataSource<T, ID>', required: false, description: 'DataSource for data binding' },
                    dataField: { type: 'string', required: false, description: 'Field name for data binding' },
                    label: { type: 'string', required: false, description: 'Input label' },
                    placeholder: { type: 'string', required: false, description: 'Placeholder text' },
                    min: { type: 'number', required: false, description: 'Minimum value' },
                    max: { type: 'number', required: false, description: 'Maximum value' },
                    step: { type: 'number', required: false, description: 'Step increment', defaultValue: 1 },
                    precision: { type: 'number', required: false, description: 'Decimal precision' },
                    disabled: { type: 'boolean', required: false, description: 'Disable input', defaultValue: false },
                    hideControls: { type: 'boolean', required: false, description: 'Hide increment/decrement buttons', defaultValue: false }
                },
                examples: [
                    {
                        title: 'Price input with currency',
                        description: 'Number input for monetary values',
                        file: 'examples/number-price.tsx',
                        tags: ['number', 'price', 'currency']
                    }
                ],
                patterns: [],
                relatedComponents: ['ArchbaseEdit', 'ArchbaseCurrency'],
                dependencies: ['@archbase/react'],
                complexity: 'low',
                useCases: ['forms', 'numeric data', 'quantities', 'prices'],
                aiHints: [
                    'Set min/max for validation',
                    'Use precision for decimal values',
                    'Perfect for price and quantity fields',
                    'Consider hideControls for clean look'
                ]
            },
            'ArchbaseModal': {
                name: 'ArchbaseModal',
                description: 'Modal dialog component with customizable content and actions',
                category: 'overlays',
                version: '2.1.4',
                status: 'stable',
                props: {
                    opened: { type: 'boolean', required: true, description: 'Modal open state' },
                    onClose: { type: '() => void', required: true, description: 'Close handler' },
                    title: { type: 'string', required: false, description: 'Modal title' },
                    children: { type: 'ReactNode', required: true, description: 'Modal content' },
                    size: { type: 'xs | sm | md | lg | xl | auto', required: false, description: 'Modal size', defaultValue: 'md' },
                    centered: { type: 'boolean', required: false, description: 'Center modal vertically', defaultValue: false },
                    closeOnClickOutside: { type: 'boolean', required: false, description: 'Close on outside click', defaultValue: true },
                    closeOnEscape: { type: 'boolean', required: false, description: 'Close on escape key', defaultValue: true }
                },
                examples: [
                    {
                        title: 'Confirmation modal',
                        description: 'Modal for delete confirmation',
                        file: 'examples/modal-confirm.tsx',
                        tags: ['modal', 'confirmation', 'delete']
                    }
                ],
                patterns: [],
                relatedComponents: ['ArchbaseDialog', 'ArchbaseDrawer'],
                dependencies: ['@archbase/react'],
                complexity: 'medium',
                useCases: ['confirmations', 'forms', 'details', 'overlays'],
                aiHints: [
                    'Use for confirmations and forms',
                    'Set appropriate size for content',
                    'Handle onClose properly',
                    'Essential for user interactions'
                ]
            },
            'ArchbaseNotifications': {
                name: 'ArchbaseNotifications',
                description: 'Notification system for displaying messages and alerts',
                category: 'feedback',
                version: '2.1.4',
                status: 'stable',
                props: {
                    position: { type: 'top-left | top-right | bottom-left | bottom-right', required: false, description: 'Notification position', defaultValue: 'top-right' },
                    limit: { type: 'number', required: false, description: 'Maximum notifications', defaultValue: 5 },
                    autoClose: { type: 'number | false', required: false, description: 'Auto close delay in ms', defaultValue: 4000 }
                },
                examples: [
                    {
                        title: 'Success notification',
                        description: 'Show success message after save',
                        file: 'examples/notification-success.tsx',
                        tags: ['notification', 'success', 'feedback']
                    }
                ],
                patterns: [],
                relatedComponents: ['ArchbaseAlert', 'ArchbaseToast'],
                dependencies: ['@archbase/react'],
                complexity: 'low',
                useCases: ['feedback', 'alerts', 'status updates', 'error handling'],
                aiHints: [
                    'Use static methods for simple notifications',
                    'Set appropriate autoClose timing',
                    'Perfect for form feedback',
                    'Essential for user experience'
                ]
            },
            'ArchbaseNavigation': {
                name: 'ArchbaseNavigation',
                description: 'Navigation component for application routing and menu structure',
                category: 'navigation',
                version: '2.1.4',
                status: 'stable',
                props: {
                    navigationData: { type: 'ArchbaseNavigationItem[]', required: true, description: 'Navigation structure data' },
                    collapsed: { type: 'boolean', required: false, description: 'Collapsed state', defaultValue: false },
                    onCollapse: { type: '(collapsed: boolean) => void', required: false, description: 'Collapse toggle handler' },
                    theme: { type: 'light | dark', required: false, description: 'Navigation theme', defaultValue: 'light' },
                    showLabels: { type: 'boolean', required: false, description: 'Show navigation labels', defaultValue: true }
                },
                examples: [
                    {
                        title: 'Admin navigation menu',
                        description: 'Complete admin navigation with categories',
                        file: 'examples/navigation-admin.tsx',
                        tags: ['navigation', 'admin', 'menu']
                    }
                ],
                patterns: [],
                relatedComponents: ['ArchbaseNavigationItem', 'ArchbaseBreadcrumbs'],
                dependencies: ['@archbase/react'],
                complexity: 'high',
                useCases: ['admin panels', 'app navigation', 'menus', 'routing'],
                aiHints: [
                    'Use navigationData for menu structure',
                    'Support for nested navigation items',
                    'Perfect for admin applications',
                    'Essential for application navigation'
                ]
            },
            'ArchbaseAsyncSelect': {
                name: 'ArchbaseAsyncSelect',
                description: 'Async select component that loads options dynamically with pagination support',
                category: 'editors',
                version: '2.1.4',
                status: 'stable',
                props: {
                    dataSource: { type: 'ArchbaseDataSource<T, ID>', required: false, description: 'DataSource for data binding' },
                    dataField: { type: 'string', required: false, description: 'Field name for data binding' },
                    loadOptions: { type: '(value: string, options: any) => Promise<OptionsResult<O>>', required: true, description: 'Async function to load options' },
                    debounce: { type: 'number', required: false, description: 'Debounce time for search in ms', defaultValue: 500 },
                    getOptionLabel: { type: '(option: O) => string', required: true, description: 'Function to extract label from option' },
                    getOptionValue: { type: '(option: O) => any', required: true, description: 'Function to extract value from option' },
                    placeholder: { type: 'string', required: false, description: 'Placeholder text' },
                    clearable: { type: 'boolean', required: false, description: 'Show clear button', defaultValue: false },
                    disabled: { type: 'boolean', required: false, description: 'Disable select', defaultValue: false }
                },
                examples: [
                    {
                        title: 'Async user search',
                        description: 'Select that searches users from API',
                        file: 'examples/async-select-users.tsx',
                        tags: ['async', 'select', 'search', 'api']
                    }
                ],
                patterns: [],
                relatedComponents: ['ArchbaseSelect', 'ArchbaseAsyncMultiSelect', 'ArchbaseLookupSelect'],
                dependencies: ['@archbase/react'],
                complexity: 'medium',
                useCases: ['remote data', 'user search', 'large datasets', 'API integration'],
                aiHints: [
                    'Use for remote data loading',
                    'Implement pagination in loadOptions',
                    'Add debounce to reduce API calls',
                    'Perfect for user/customer search'
                ]
            },
            'ArchbaseRichTextEdit': {
                name: 'ArchbaseRichTextEdit',
                description: 'Rich text editor component with full formatting capabilities using SunEditor',
                category: 'editors',
                version: '2.1.4',
                status: 'stable',
                props: {
                    dataSource: { type: 'ArchbaseDataSource<T, ID>', required: false, description: 'DataSource for data binding' },
                    dataField: { type: 'string', required: false, description: 'Field name for data binding' },
                    disabled: { type: 'boolean', required: false, description: 'Disable editor', defaultValue: false },
                    readOnly: { type: 'boolean', required: false, description: 'Read-only mode', defaultValue: false },
                    height: { type: 'string', required: false, description: 'Editor height', defaultValue: '400px' },
                    width: { type: 'string', required: false, description: 'Editor width', defaultValue: '100%' },
                    placeholder: { type: 'string', required: false, description: 'Placeholder text' },
                    defaultStyle: { type: 'string', required: false, description: 'Default editor styles' },
                    disabledBase64Convertion: { type: 'boolean', required: false, description: 'Disable base64 conversion', defaultValue: false }
                },
                examples: [
                    {
                        title: 'Article editor',
                        description: 'Rich text editor for blog articles',
                        file: 'examples/rich-text-article.tsx',
                        tags: ['rich-text', 'editor', 'wysiwyg', 'content']
                    }
                ],
                patterns: [],
                relatedComponents: ['ArchbaseTextArea', 'ArchbaseJsonEdit'],
                dependencies: ['@archbase/react', 'suneditor-react'],
                complexity: 'high',
                useCases: ['content creation', 'blog posts', 'rich formatting', 'email templates'],
                aiHints: [
                    'Use for rich content editing',
                    'Supports image upload and embedding',
                    'Can handle base64 content',
                    'Perfect for CMS and blog systems'
                ]
            },
            'ArchbaseMaskEdit': {
                name: 'ArchbaseMaskEdit',
                description: 'Masked input component with predefined patterns for common formats',
                category: 'editors',
                version: '2.1.4',
                status: 'stable',
                props: {
                    dataSource: { type: 'ArchbaseDataSource<T, ID>', required: false, description: 'DataSource for data binding' },
                    dataField: { type: 'string', required: false, description: 'Field name for data binding' },
                    mask: { type: 'string | MaskPattern', required: true, description: 'Mask pattern or predefined pattern' },
                    placeholder: { type: 'string', required: false, description: 'Placeholder text' },
                    disabled: { type: 'boolean', required: false, description: 'Disable input', defaultValue: false },
                    readOnly: { type: 'boolean', required: false, description: 'Read-only mode', defaultValue: false },
                    label: { type: 'string', required: false, description: 'Input label' },
                    lazy: { type: 'boolean', required: false, description: 'Lazy mode for mask', defaultValue: true }
                },
                examples: [
                    {
                        title: 'CPF/CNPJ input',
                        description: 'Masked input for Brazilian documents',
                        file: 'examples/mask-cpf-cnpj.tsx',
                        tags: ['mask', 'cpf', 'cnpj', 'format']
                    }
                ],
                patterns: [],
                relatedComponents: ['ArchbaseEdit', 'ArchbaseNumberEdit'],
                dependencies: ['@archbase/react', 'react-imask'],
                complexity: 'low',
                useCases: ['document numbers', 'phone numbers', 'postal codes', 'formatted inputs'],
                aiHints: [
                    'Use MaskPattern enum for common formats',
                    'Supports CPF, CNPJ, CEP, Phone patterns',
                    'Custom masks with 0 for digit, a for letter',
                    'Essential for Brazilian applications'
                ]
            },
            'ArchbaseLookupEdit': {
                name: 'ArchbaseLookupEdit',
                description: 'Lookup component with modal search functionality for complex selections',
                category: 'editors',
                version: '2.1.4',
                status: 'stable',
                props: {
                    dataSource: { type: 'ArchbaseDataSource<T, ID>', required: false, description: 'DataSource for data binding' },
                    dataField: { type: 'string', required: false, description: 'Field name for data binding' },
                    lookupDataSource: { type: 'ArchbaseDataSource<O, OID>', required: true, description: 'DataSource for lookup data' },
                    lookupDataColumns: { type: 'ColumnDef[]', required: true, description: 'Column definitions for lookup table' },
                    onLookup: { type: '() => void', required: true, description: 'Handler to open lookup modal' },
                    getOptionLabel: { type: '(option: O) => string', required: true, description: 'Function to extract display label' },
                    getOptionValue: { type: '(option: O) => any', required: true, description: 'Function to extract value' },
                    disabled: { type: 'boolean', required: false, description: 'Disable lookup', defaultValue: false },
                    placeholder: { type: 'string', required: false, description: 'Placeholder text' }
                },
                examples: [
                    {
                        title: 'Product lookup',
                        description: 'Lookup with product search modal',
                        file: 'examples/lookup-products.tsx',
                        tags: ['lookup', 'modal', 'search', 'selection']
                    }
                ],
                patterns: [],
                relatedComponents: ['ArchbaseLookupSelect', 'ArchbaseLookupNumber', 'ArchbaseAsyncSelect'],
                dependencies: ['@archbase/react'],
                complexity: 'high',
                useCases: ['complex selections', 'product search', 'customer lookup', 'modal selections'],
                aiHints: [
                    'Use for complex entity selection',
                    'Opens modal with full search capabilities',
                    'Perfect for selecting from large datasets',
                    'Combine with ArchbaseDataTable in modal'
                ]
            },
            'ArchbaseImageEdit': {
                name: 'ArchbaseImageEdit',
                description: 'Image upload and preview component with drag-and-drop support',
                category: 'editors',
                version: '2.1.4',
                status: 'stable',
                props: {
                    dataSource: { type: 'ArchbaseDataSource<T, ID>', required: false, description: 'DataSource for data binding' },
                    dataField: { type: 'string', required: false, description: 'Field name for data binding' },
                    onImageChange: { type: '(file: File | null) => void', required: false, description: 'Image change handler' },
                    maxSize: { type: 'number', required: false, description: 'Max file size in bytes', defaultValue: 5242880 },
                    accept: { type: 'string[]', required: false, description: 'Accepted file types', defaultValue: ['image/*'] },
                    disabled: { type: 'boolean', required: false, description: 'Disable upload', defaultValue: false },
                    width: { type: 'number | string', required: false, description: 'Component width' },
                    height: { type: 'number | string', required: false, description: 'Component height' }
                },
                examples: [
                    {
                        title: 'Profile picture upload',
                        description: 'Image upload for user profiles',
                        file: 'examples/image-profile.tsx',
                        tags: ['image', 'upload', 'profile', 'drag-drop']
                    }
                ],
                patterns: [],
                relatedComponents: ['ArchbaseAvatarEdit', 'ArchbaseFileAttachment'],
                dependencies: ['@archbase/react'],
                complexity: 'medium',
                useCases: ['profile pictures', 'product images', 'document uploads', 'galleries'],
                aiHints: [
                    'Supports drag and drop',
                    'Preview before upload',
                    'Can handle base64 conversion',
                    'Perfect for user avatars and product images'
                ]
            },
            'ArchbaseJsonEdit': {
                name: 'ArchbaseJsonEdit',
                description: 'JSON editor component with syntax highlighting and validation',
                category: 'editors',
                version: '2.1.4',
                status: 'stable',
                props: {
                    dataSource: { type: 'ArchbaseDataSource<T, ID>', required: false, description: 'DataSource for data binding' },
                    dataField: { type: 'string', required: false, description: 'Field name for data binding' },
                    value: { type: 'object | string', required: false, description: 'JSON value' },
                    onChange: { type: '(value: any) => void', required: false, description: 'Change handler' },
                    height: { type: 'string', required: false, description: 'Editor height', defaultValue: '400px' },
                    readOnly: { type: 'boolean', required: false, description: 'Read-only mode', defaultValue: false },
                    theme: { type: 'light | dark', required: false, description: 'Editor theme', defaultValue: 'light' }
                },
                examples: [
                    {
                        title: 'API configuration editor',
                        description: 'JSON editor for API settings',
                        file: 'examples/json-api-config.tsx',
                        tags: ['json', 'editor', 'configuration', 'api']
                    }
                ],
                patterns: [],
                relatedComponents: ['ArchbaseKeyValueEditor', 'ArchbaseRichTextEdit'],
                dependencies: ['@archbase/react'],
                complexity: 'medium',
                useCases: ['configuration', 'API payloads', 'settings', 'debugging'],
                aiHints: [
                    'Use for JSON configuration editing',
                    'Validates JSON syntax automatically',
                    'Supports syntax highlighting',
                    'Essential for API development tools'
                ]
            },
            'ArchbaseSwitch': {
                name: 'ArchbaseSwitch',
                description: 'Toggle switch component for boolean values with DataSource integration',
                category: 'editors',
                version: '2.1.4',
                status: 'stable',
                props: {
                    dataSource: { type: 'ArchbaseDataSource<T, ID>', required: false, description: 'DataSource for data binding' },
                    dataField: { type: 'string', required: false, description: 'Field name for data binding' },
                    label: { type: 'string', required: false, description: 'Switch label' },
                    onLabel: { type: 'string', required: false, description: 'Label when on', defaultValue: 'ON' },
                    offLabel: { type: 'string', required: false, description: 'Label when off', defaultValue: 'OFF' },
                    disabled: { type: 'boolean', required: false, description: 'Disable switch', defaultValue: false },
                    size: { type: 'xs | sm | md | lg | xl', required: false, description: 'Switch size', defaultValue: 'md' },
                    color: { type: 'string', required: false, description: 'Switch color', defaultValue: 'blue' }
                },
                examples: [
                    {
                        title: 'Active status toggle',
                        description: 'Switch for enabling/disabling features',
                        file: 'examples/switch-active.tsx',
                        tags: ['switch', 'toggle', 'boolean', 'status']
                    }
                ],
                patterns: [],
                relatedComponents: ['ArchbaseCheckbox', 'ArchbaseRadio'],
                dependencies: ['@archbase/react'],
                complexity: 'low',
                useCases: ['feature toggles', 'settings', 'active/inactive status', 'preferences'],
                aiHints: [
                    'Use for boolean toggles',
                    'More visual than checkboxes',
                    'Perfect for on/off settings',
                    'Good for feature flags'
                ]
            },
            'ArchbaseRating': {
                name: 'ArchbaseRating',
                description: 'Rating component with customizable icons and fractional values',
                category: 'editors',
                version: '2.1.4',
                status: 'stable',
                props: {
                    dataSource: { type: 'ArchbaseDataSource<T, ID>', required: false, description: 'DataSource for data binding' },
                    dataField: { type: 'string', required: false, description: 'Field name for data binding' },
                    count: { type: 'number', required: false, description: 'Number of rating items', defaultValue: 5 },
                    fractions: { type: 'number', required: false, description: 'Number of fractions', defaultValue: 1 },
                    disabled: { type: 'boolean', required: false, description: 'Disable rating', defaultValue: false },
                    readOnly: { type: 'boolean', required: false, description: 'Read-only mode', defaultValue: false },
                    size: { type: 'xs | sm | md | lg | xl', required: false, description: 'Rating size', defaultValue: 'md' },
                    color: { type: 'string', required: false, description: 'Rating color', defaultValue: 'yellow' }
                },
                examples: [
                    {
                        title: 'Product rating',
                        description: 'Star rating for product reviews',
                        file: 'examples/rating-product.tsx',
                        tags: ['rating', 'stars', 'review', 'feedback']
                    }
                ],
                patterns: [],
                relatedComponents: ['ArchbaseNumberEdit'],
                dependencies: ['@archbase/react'],
                complexity: 'low',
                useCases: ['product reviews', 'feedback', 'ratings', 'satisfaction scores'],
                aiHints: [
                    'Use for rating/review systems',
                    'Supports fractional values',
                    'Customizable icon count',
                    'Perfect for user feedback'
                ]
            },
            'ArchbaseCronExpressionEdit': {
                name: 'ArchbaseCronExpressionEdit',
                description: 'Cron expression editor with visual builder and validation',
                category: 'editors',
                version: '2.1.4',
                status: 'stable',
                props: {
                    dataSource: { type: 'ArchbaseDataSource<T, ID>', required: false, description: 'DataSource for data binding' },
                    dataField: { type: 'string', required: false, description: 'Field name for data binding' },
                    value: { type: 'string', required: false, description: 'Cron expression value' },
                    onChange: { type: '(value: string) => void', required: false, description: 'Change handler' },
                    disabled: { type: 'boolean', required: false, description: 'Disable editor', defaultValue: false },
                    showPreview: { type: 'boolean', required: false, description: 'Show execution preview', defaultValue: true },
                    locale: { type: 'string', required: false, description: 'Locale for labels', defaultValue: 'en' }
                },
                examples: [
                    {
                        title: 'Schedule configuration',
                        description: 'Cron editor for job scheduling',
                        file: 'examples/cron-scheduler.tsx',
                        tags: ['cron', 'schedule', 'timing', 'jobs']
                    }
                ],
                patterns: [],
                relatedComponents: ['ArchbaseTimeEdit', 'ArchbaseOperationHoursEditor'],
                dependencies: ['@archbase/react'],
                complexity: 'high',
                useCases: ['job scheduling', 'task automation', 'recurring events', 'batch processing'],
                aiHints: [
                    'Use for cron job configuration',
                    'Visual builder for non-technical users',
                    'Shows next execution times',
                    'Essential for scheduling systems'
                ]
            },
            'ArchbaseKeyValueEditor': {
                name: 'ArchbaseKeyValueEditor',
                description: 'Key-value pair editor for dynamic property management',
                category: 'editors',
                version: '2.1.4',
                status: 'stable',
                props: {
                    dataSource: { type: 'ArchbaseDataSource<T, ID>', required: false, description: 'DataSource for data binding' },
                    dataField: { type: 'string', required: false, description: 'Field name for data binding' },
                    value: { type: 'Record<string, any>', required: false, description: 'Key-value pairs object' },
                    onChange: { type: '(value: Record<string, any>) => void', required: false, description: 'Change handler' },
                    keyPlaceholder: { type: 'string', required: false, description: 'Placeholder for key input', defaultValue: 'Key' },
                    valuePlaceholder: { type: 'string', required: false, description: 'Placeholder for value input', defaultValue: 'Value' },
                    disabled: { type: 'boolean', required: false, description: 'Disable editor', defaultValue: false },
                    allowAdd: { type: 'boolean', required: false, description: 'Allow adding new pairs', defaultValue: true },
                    allowDelete: { type: 'boolean', required: false, description: 'Allow deleting pairs', defaultValue: true }
                },
                examples: [
                    {
                        title: 'Environment variables editor',
                        description: 'Key-value editor for env vars',
                        file: 'examples/keyvalue-env.tsx',
                        tags: ['key-value', 'properties', 'configuration', 'dynamic']
                    }
                ],
                patterns: [],
                relatedComponents: ['ArchbaseJsonEdit'],
                dependencies: ['@archbase/react'],
                complexity: 'medium',
                useCases: ['configuration', 'environment variables', 'metadata', 'custom properties'],
                aiHints: [
                    'Use for dynamic property editing',
                    'Perfect for configuration UIs',
                    'Supports add/remove operations',
                    'Great for metadata management'
                ]
            },
            'ArchbaseOperationHoursEditor': {
                name: 'ArchbaseOperationHoursEditor',
                description: 'Operation hours editor for business hours configuration',
                category: 'editors',
                version: '2.1.4',
                status: 'stable',
                props: {
                    dataSource: { type: 'ArchbaseDataSource<T, ID>', required: false, description: 'DataSource for data binding' },
                    dataField: { type: 'string', required: false, description: 'Field name for data binding' },
                    value: { type: 'OperationHours[]', required: false, description: 'Operation hours data' },
                    onChange: { type: '(value: OperationHours[]) => void', required: false, description: 'Change handler' },
                    disabled: { type: 'boolean', required: false, description: 'Disable editor', defaultValue: false },
                    use24HourFormat: { type: 'boolean', required: false, description: 'Use 24-hour time format', defaultValue: false },
                    showClosedDays: { type: 'boolean', required: false, description: 'Show closed days', defaultValue: true }
                },
                examples: [
                    {
                        title: 'Store hours configuration',
                        description: 'Business hours editor for stores',
                        file: 'examples/hours-store.tsx',
                        tags: ['hours', 'schedule', 'business', 'time']
                    }
                ],
                patterns: [],
                relatedComponents: ['ArchbaseTimeEdit', 'ArchbaseTimeRangeSelector'],
                dependencies: ['@archbase/react'],
                complexity: 'medium',
                useCases: ['business hours', 'store schedules', 'availability', 'opening hours'],
                aiHints: [
                    'Use for business hours configuration',
                    'Supports multiple time ranges per day',
                    'Handles closed days',
                    'Perfect for store/restaurant apps'
                ]
            },
            'ArchbaseTimeRangeSelector': {
                name: 'ArchbaseTimeRangeSelector',
                description: 'Time range selector for selecting start and end times',
                category: 'editors',
                version: '2.1.4',
                status: 'stable',
                props: {
                    dataSource: { type: 'ArchbaseDataSource<T, ID>', required: false, description: 'DataSource for data binding' },
                    startTimeField: { type: 'string', required: false, description: 'Field for start time' },
                    endTimeField: { type: 'string', required: false, description: 'Field for end time' },
                    disabled: { type: 'boolean', required: false, description: 'Disable selector', defaultValue: false },
                    format: { type: '12 | 24', required: false, description: 'Time format', defaultValue: '24' },
                    minTime: { type: 'string', required: false, description: 'Minimum selectable time' },
                    maxTime: { type: 'string', required: false, description: 'Maximum selectable time' },
                    step: { type: 'number', required: false, description: 'Time step in minutes', defaultValue: 15 }
                },
                examples: [
                    {
                        title: 'Meeting time selector',
                        description: 'Time range for scheduling meetings',
                        file: 'examples/timerange-meeting.tsx',
                        tags: ['time', 'range', 'schedule', 'duration']
                    }
                ],
                patterns: [],
                relatedComponents: ['ArchbaseTimeEdit', 'ArchbaseDateTimePickerRange'],
                dependencies: ['@archbase/react'],
                complexity: 'medium',
                useCases: ['scheduling', 'appointments', 'time slots', 'duration selection'],
                aiHints: [
                    'Use for time period selection',
                    'Validates end time after start time',
                    'Configurable time steps',
                    'Perfect for appointment systems'
                ]
            },
            'ArchbaseTreeSelect': {
                name: 'ArchbaseTreeSelect',
                description: 'Tree select component for hierarchical data selection',
                category: 'editors',
                version: '2.1.4',
                status: 'stable',
                props: {
                    dataSource: { type: 'ArchbaseDataSource<T, ID>', required: false, description: 'DataSource for data binding' },
                    dataField: { type: 'string', required: false, description: 'Field name for data binding' },
                    data: { type: 'TreeNode[]', required: true, description: 'Hierarchical tree data' },
                    multiple: { type: 'boolean', required: false, description: 'Allow multiple selection', defaultValue: false },
                    checkable: { type: 'boolean', required: false, description: 'Show checkboxes', defaultValue: false },
                    searchable: { type: 'boolean', required: false, description: 'Enable search', defaultValue: false },
                    placeholder: { type: 'string', required: false, description: 'Placeholder text' },
                    disabled: { type: 'boolean', required: false, description: 'Disable tree select', defaultValue: false }
                },
                examples: [
                    {
                        title: 'Category tree selector',
                        description: 'Hierarchical category selection',
                        file: 'examples/tree-categories.tsx',
                        tags: ['tree', 'hierarchy', 'categories', 'nested']
                    }
                ],
                patterns: [],
                relatedComponents: ['ArchbaseSelect', 'ArchbaseAsyncSelect'],
                dependencies: ['@archbase/react'],
                complexity: 'high',
                useCases: ['category selection', 'organization structure', 'file systems', 'hierarchies'],
                aiHints: [
                    'Use for hierarchical data selection',
                    'Supports multiple selection modes',
                    'Can handle large tree structures',
                    'Perfect for category/department selection'
                ]
            },
            'ArchbaseChipGroup': {
                name: 'ArchbaseChipGroup',
                description: 'Chip group component for tag/category selection with DataSource integration',
                category: 'editors',
                version: '2.1.4',
                status: 'stable',
                props: {
                    dataSource: { type: 'ArchbaseDataSource<T, ID>', required: false, description: 'DataSource for data binding' },
                    dataField: { type: 'string', required: false, description: 'Field name for data binding' },
                    data: { type: 'any[]', required: true, description: 'Array of chip options' },
                    multiple: { type: 'boolean', required: false, description: 'Allow multiple selection', defaultValue: false },
                    getOptionLabel: { type: '(option: any) => string', required: false, description: 'Label extraction function' },
                    getOptionValue: { type: '(option: any) => any', required: false, description: 'Value extraction function' },
                    color: { type: 'string', required: false, description: 'Chip color theme', defaultValue: 'blue' },
                    disabled: { type: 'boolean', required: false, description: 'Disable chip group', defaultValue: false }
                },
                examples: [
                    {
                        title: 'Tag selector',
                        description: 'Chip group for selecting tags',
                        file: 'examples/chip-tags.tsx',
                        tags: ['chip', 'tags', 'selection', 'categories']
                    }
                ],
                patterns: [],
                relatedComponents: ['ArchbaseChip', 'ArchbaseChipItem', 'ArchbaseSelect'],
                dependencies: ['@archbase/react'],
                complexity: 'low',
                useCases: ['tag selection', 'filters', 'categories', 'skills'],
                aiHints: [
                    'Use for tag/category selection',
                    'More visual than select boxes',
                    'Good for filters and facets',
                    'Perfect for skill selection'
                ]
            },
            'ArchbaseFileAttachment': {
                name: 'ArchbaseFileAttachment',
                description: 'File attachment component with upload, preview and management capabilities',
                category: 'editors',
                version: '2.1.4',
                status: 'stable',
                props: {
                    dataSource: { type: 'ArchbaseDataSource<T, ID>', required: false, description: 'DataSource for data binding' },
                    dataField: { type: 'string', required: false, description: 'Field name for data binding' },
                    multiple: { type: 'boolean', required: false, description: 'Allow multiple files', defaultValue: false },
                    maxFiles: { type: 'number', required: false, description: 'Maximum number of files' },
                    maxSize: { type: 'number', required: false, description: 'Max file size in bytes' },
                    accept: { type: 'string[]', required: false, description: 'Accepted file types' },
                    onUpload: { type: '(files: File[]) => Promise<void>', required: false, description: 'Upload handler' },
                    disabled: { type: 'boolean', required: false, description: 'Disable uploads', defaultValue: false }
                },
                examples: [
                    {
                        title: 'Document attachments',
                        description: 'File attachment for documents',
                        file: 'examples/attachment-docs.tsx',
                        tags: ['file', 'upload', 'attachment', 'documents']
                    }
                ],
                patterns: [],
                relatedComponents: ['ArchbaseImageEdit', 'ArchbaseAvatarEdit'],
                dependencies: ['@archbase/react'],
                complexity: 'medium',
                useCases: ['document uploads', 'attachments', 'file management', 'evidence'],
                aiHints: [
                    'Use for file attachment management',
                    'Supports multiple file uploads',
                    'Preview for images and PDFs',
                    'Essential for document systems'
                ]
            },
            'ArchbasePasswordEdit': {
                name: 'ArchbasePasswordEdit',
                description: 'Password input component with strength indicator and visibility toggle',
                category: 'editors',
                version: '2.1.4',
                status: 'stable',
                props: {
                    dataSource: { type: 'ArchbaseDataSource<T, ID>', required: false, description: 'DataSource for data binding' },
                    dataField: { type: 'string', required: false, description: 'Field name for data binding' },
                    label: { type: 'string', required: false, description: 'Input label' },
                    placeholder: { type: 'string', required: false, description: 'Placeholder text' },
                    showStrength: { type: 'boolean', required: false, description: 'Show password strength', defaultValue: false },
                    minLength: { type: 'number', required: false, description: 'Minimum password length' },
                    disabled: { type: 'boolean', required: false, description: 'Disable input', defaultValue: false },
                    required: { type: 'boolean', required: false, description: 'Required field', defaultValue: false }
                },
                examples: [
                    {
                        title: 'User password field',
                        description: 'Password with strength indicator',
                        file: 'examples/password-strength.tsx',
                        tags: ['password', 'security', 'strength', 'auth']
                    }
                ],
                patterns: [],
                relatedComponents: ['ArchbaseEdit', 'ArchbaseMaskEdit'],
                dependencies: ['@archbase/react'],
                complexity: 'low',
                useCases: ['authentication', 'password change', 'user registration', 'security'],
                aiHints: [
                    'Use for password inputs',
                    'Include strength indicator for UX',
                    'Toggle visibility for convenience',
                    'Essential for auth forms'
                ]
            },
            'ArchbaseColorPicker': {
                name: 'ArchbaseColorPicker',
                description: 'Color picker component with various formats and swatches',
                category: 'editors',
                version: '2.1.4',
                status: 'stable',
                props: {
                    dataSource: { type: 'ArchbaseDataSource<T, ID>', required: false, description: 'DataSource for data binding' },
                    dataField: { type: 'string', required: false, description: 'Field name for data binding' },
                    format: { type: 'hex | rgb | hsl', required: false, description: 'Color format', defaultValue: 'hex' },
                    swatches: { type: 'string[]', required: false, description: 'Predefined color swatches' },
                    disabled: { type: 'boolean', required: false, description: 'Disable picker', defaultValue: false },
                    withPicker: { type: 'boolean', required: false, description: 'Show color picker', defaultValue: true },
                    label: { type: 'string', required: false, description: 'Input label' }
                },
                examples: [
                    {
                        title: 'Theme color selector',
                        description: 'Color picker for theme customization',
                        file: 'examples/color-theme.tsx',
                        tags: ['color', 'picker', 'theme', 'customization']
                    }
                ],
                patterns: [],
                relatedComponents: ['ArchbaseSelect'],
                dependencies: ['@archbase/react'],
                complexity: 'medium',
                useCases: ['theme customization', 'design tools', 'branding', 'preferences'],
                aiHints: [
                    'Use for color selection',
                    'Supports multiple color formats',
                    'Include swatches for brand colors',
                    'Perfect for customization features'
                ]
            },
            'ArchbaseAvatarEdit': {
                name: 'ArchbaseAvatarEdit',
                description: 'Avatar upload component with crop and preview functionality',
                category: 'editors',
                version: '2.1.4',
                status: 'stable',
                props: {
                    dataSource: { type: 'ArchbaseDataSource<T, ID>', required: false, description: 'DataSource for data binding' },
                    dataField: { type: 'string', required: false, description: 'Field name for data binding' },
                    size: { type: 'xs | sm | md | lg | xl', required: false, description: 'Avatar size', defaultValue: 'md' },
                    onImageChange: { type: '(file: File | null) => void', required: false, description: 'Image change handler' },
                    allowCrop: { type: 'boolean', required: false, description: 'Enable image cropping', defaultValue: true },
                    shape: { type: 'circle | square', required: false, description: 'Avatar shape', defaultValue: 'circle' },
                    disabled: { type: 'boolean', required: false, description: 'Disable upload', defaultValue: false }
                },
                examples: [
                    {
                        title: 'User profile avatar',
                        description: 'Avatar upload with cropping',
                        file: 'examples/avatar-profile.tsx',
                        tags: ['avatar', 'profile', 'upload', 'image']
                    }
                ],
                patterns: [],
                relatedComponents: ['ArchbaseImageEdit', 'ArchbaseFileAttachment'],
                dependencies: ['@archbase/react'],
                complexity: 'medium',
                useCases: ['user profiles', 'avatars', 'team members', 'contact photos'],
                aiHints: [
                    'Use for profile picture uploads',
                    'Includes crop functionality',
                    'Circular or square shapes',
                    'Perfect for user management'
                ]
            }
        };
        Object.entries(defaultComponents).forEach(([name, info]) => {
            this.componentsCache.set(name, info);
        });
    }
    async initializeDefaultPatterns() {
        this.patternsCache = [
            {
                name: 'datasource-v2-form',
                title: 'DataSource V2 Form',
                description: 'Form using ArchbaseFormTemplate with DataSource V2 integration',
                components: ['ArchbaseFormTemplate', 'ArchbaseEdit', 'ArchbaseSelect', 'useArchbaseRemoteDataSource'],
                template: 'forms/datasource-v2.hbs',
                examples: ['examples/form-datasource-v2.tsx'],
                complexity: 'medium',
                tags: ['form', 'datasource-v2', 'validation', 'admin']
            },
            {
                name: 'admin-crud-grid',
                title: 'Admin CRUD Grid',
                description: 'Complete CRUD grid with permissions following powerview-admin pattern',
                components: ['ArchbaseDataGrid', 'ArchbaseDataGridColumn', 'ArchbaseButton', 'useArchbaseRemoteDataSource'],
                template: 'views/crud-list.hbs',
                examples: ['examples/admin-crud-grid.tsx'],
                complexity: 'medium',
                tags: ['grid', 'crud', 'permissions', 'admin', 'datasource-v2']
            },
            {
                name: 'admin-navigation',
                title: 'Admin Navigation',
                description: 'Navigation structure following powerview-admin routing patterns',
                components: ['ArchbaseNavigation', 'ArchbaseNavigationItem'],
                template: 'navigation/navigation-item.hbs',
                examples: ['examples/admin-navigation.tsx'],
                complexity: 'high',
                tags: ['navigation', 'admin', 'routing', 'menu']
            },
            {
                name: 'enum-status-select',
                title: 'Enum Status Select',
                description: 'Select component using enum values with proper rendering',
                components: ['ArchbaseSelect', 'ArchbaseItemRender'],
                template: 'components/enum-select.hbs',
                examples: ['examples/status-select.tsx'],
                complexity: 'low',
                tags: ['select', 'enum', 'status', 'rendering']
            },
            {
                name: 'modal-confirmation',
                title: 'Confirmation Modal',
                description: 'Modal for user confirmations with proper UX patterns',
                components: ['ArchbaseModal', 'ArchbaseButton', 'ArchbaseDialog'],
                template: 'overlays/confirmation-modal.hbs',
                examples: ['examples/confirmation-modal.tsx'],
                complexity: 'low',
                tags: ['modal', 'confirmation', 'dialog', 'ux']
            },
            {
                name: 'notification-feedback',
                title: 'Notification Feedback',
                description: 'User feedback using notifications for success/error states',
                components: ['ArchbaseNotifications'],
                template: 'feedback/notifications.hbs',
                examples: ['examples/notification-feedback.tsx'],
                complexity: 'low',
                tags: ['notification', 'feedback', 'success', 'error']
            },
            {
                name: 'date-range-filter',
                title: 'Date Range Filter',
                description: 'Date range filtering for data grids and search forms',
                components: ['ArchbaseDate', 'ArchbaseDataGrid'],
                template: 'filters/date-range.hbs',
                examples: ['examples/date-range-filter.tsx'],
                complexity: 'medium',
                tags: ['date', 'filter', 'range', 'search']
            },
            {
                name: 'user-registration-form',
                title: 'User Registration Form',
                description: 'Complete user registration with validation and DataSource V2',
                components: ['ArchbaseFormTemplate', 'ArchbaseEdit', 'ArchbaseCheckbox', 'ArchbaseButton'],
                template: 'forms/user-registration.hbs',
                examples: ['examples/user-registration.tsx'],
                complexity: 'medium',
                tags: ['form', 'registration', 'validation', 'user']
            },
            {
                name: 'product-catalog',
                title: 'Product Catalog',
                description: 'Product listing with filters, search, and pagination',
                components: ['ArchbaseDataGrid', 'ArchbaseEdit', 'ArchbaseSelect', 'ArchbaseNumber'],
                template: 'views/product-catalog.hbs',
                examples: ['examples/product-catalog.tsx'],
                complexity: 'high',
                tags: ['catalog', 'products', 'ecommerce', 'filters']
            },
            {
                name: 'settings-form',
                title: 'Settings Form',
                description: 'Application settings form with various input types',
                components: ['ArchbaseFormTemplate', 'ArchbaseCheckbox', 'ArchbaseSelect', 'ArchbaseTextArea'],
                template: 'forms/settings.hbs',
                examples: ['examples/settings-form.tsx'],
                complexity: 'medium',
                tags: ['settings', 'preferences', 'configuration', 'form']
            }
        ];
    }
}
exports.KnowledgeBase = KnowledgeBase;
//# sourceMappingURL=KnowledgeBase.js.map