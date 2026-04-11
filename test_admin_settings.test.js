
describe('Admin Settings Logic', () => {
    let admin;
    let inputMock, btnMock;
    let genericInputMock;

    beforeEach(() => {
        jest.resetModules();

        inputMock = { value: '', disabled: false };
        btnMock = { disabled: false, textContent: '' };
        genericInputMock = { value: '', disabled: false, files: [] };

        const mockSupabaseBuilder = {
            select: jest.fn().mockReturnThis(),
            order: jest.fn().mockReturnThis(),
            eq: jest.fn().mockReturnThis(),
            single: jest.fn().mockReturnThis(),
            insert: jest.fn().mockReturnThis(),
            update: jest.fn().mockReturnThis(),
            delete: jest.fn().mockReturnThis(),
            upsert: jest.fn().mockReturnThis(),
            upload: jest.fn().mockReturnThis(),
            getPublicUrl: jest.fn().mockReturnThis(),
            then: function(resolve) { resolve({ data: [], error: null }); } // Makes it awaitable
        };

        global.document = {
            getElementById: jest.fn((id) => {
                if (id === 'setting-egp-usd') return inputMock;
                if (id === 'save-settings-btn') return btnMock;
                if (id.startsWith('setting-')) return genericInputMock;

                return {
                    addEventListener: jest.fn(),
                    classList: { add: jest.fn(), remove: jest.fn() },
                    value: '',
                    files: [],
                    textContent: ''
                };
            }),
            addEventListener: jest.fn(),
            querySelector: jest.fn((selector) => {
                // If it's looking for social containers, return something or null
                if (selector.includes('container-social')) {
                    return {
                        querySelector: jest.fn().mockReturnValue(null),
                        querySelectorAll: jest.fn().mockReturnValue([]),
                        innerHTML: ''
                    };
                }
                return null;
            }),
            querySelectorAll: jest.fn().mockReturnValue([])
        };
        global.window = {
            location: { pathname: '/admin.html' },
            history: { replaceState: jest.fn() },
            confirm: jest.fn().mockReturnValue(true)
        };
        global.alert = jest.fn();
        global.showToast = jest.fn();

        global.supabase = {
            auth: {
                onAuthStateChange: jest.fn(),
                signInWithPassword: jest.fn(),
                signOut: jest.fn(),
                getSession: jest.fn().mockResolvedValue({ data: { session: null }, error: null })
            },
            from: jest.fn().mockReturnValue(mockSupabaseBuilder),
            storage: {
                from: jest.fn().mockReturnValue(mockSupabaseBuilder)
            }
        };

        jest.spyOn(console, 'error').mockImplementation(() => {});

        // Mock the DB helpers that admin.js now expects
        global.window.settingsDb = {
            getAll: jest.fn(),
            update: jest.fn(),
            updateMultiple: jest.fn()
        };

        admin = require('./admin.js');
    });

    test('loadSettings fetches and sets value', async () => {
        const mockSettings = {
            exchange_rate: '55.5'
        };

        global.window.settingsDb.getAll.mockResolvedValue(mockSettings);

        await admin.loadSettings();

        expect(inputMock.value).toBe('55.5');
    });

    test('handleSaveSettings updates value', async () => {
        inputMock.value = '60';
        global.window.settingsDb.updateMultiple.mockResolvedValue({ error: null });

        const event = { preventDefault: jest.fn() };
        await admin.handleSaveSettings(event);

        expect(global.window.settingsDb.updateMultiple).toHaveBeenCalled();
        const args = global.window.settingsDb.updateMultiple.mock.calls[0][0];

        expect(args).toContainEqual(expect.objectContaining({ key: 'exchange_rate', value: '60' }));
        expect(global.showToast).toHaveBeenCalledWith('Settings saved');
    });
});
