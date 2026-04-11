
/**
 * @jest-environment node
 */

// Mock globals before require
global.window = {
    location: { search: '?id=1' },
    localStorage: { getItem: jest.fn(), setItem: jest.fn() }
};
global.localStorage = global.window.localStorage;
global.document = {
    getElementById: jest.fn(),
    querySelector: jest.fn(),
    querySelectorAll: jest.fn().mockReturnValue([]),
    addEventListener: jest.fn(),
    createElement: jest.fn().mockReturnValue({ parentElement: { querySelectorAll: jest.fn().mockReturnValue([]) }, style: {}, classList: { add: jest.fn(), remove: jest.fn() } }),
    documentElement: {
        setAttribute: jest.fn(),
        classList: { add: jest.fn(), remove: jest.fn() }
    }
};
global.alert = jest.fn();
global.supabase = {
    from: jest.fn(),
    channel: jest.fn().mockReturnValue({
        on: jest.fn().mockReturnThis(),
        subscribe: jest.fn().mockReturnThis()
    })
};

global.window.productsDb = {
    getAll: jest.fn().mockResolvedValue([])
};
global.window.settingsDb = {
    getAll: jest.fn().mockResolvedValue({})
};
global.window.brandsDb = {
    getAll: jest.fn().mockResolvedValue([])
};
global.window.categoriesDb = {
    getAll: jest.fn().mockResolvedValue([])
};
global.window.messagesDb = {
    create: jest.fn().mockResolvedValue({})
};

// Mock console
global.console = {
    log: jest.fn(),
    error: jest.fn(),
    warn: jest.fn()
};

const script = require('./script.js');

describe('loadDetails', () => {
    beforeEach(() => {
        jest.clearAllMocks();

        // Provide mock elements for getElementById and querySelector
        const mockElement = {
            innerHTML: '',
            textContent: '',
            style: {},
            setAttribute: jest.fn(),
            classList: { add: jest.fn(), remove: jest.fn() },
            remove: jest.fn(),
            appendChild: jest.fn(),
            pause: jest.fn(),
            play: jest.fn().mockResolvedValue()
        };
        global.document.getElementById.mockReturnValue(mockElement);
        global.document.querySelector.mockReturnValue(mockElement);


        // Reset window location
        window.location.search = '?id=1';

        // Mock supabase response for products
        global.supabase.from.mockReturnValue({
            select: jest.fn().mockReturnThis(),
            order: jest.fn().mockResolvedValue({
                data: [{
                    id: 1,
                    name: 'Test Car',
                    image_url: 'test.jpg',
                    price_usd: 10000,
                    category: 'SUV',
                    details: { mileage: '10km', transmission: 'Auto', fuel: 'Petrol' }
                }],
                error: null
            })
        });

        // Mock DOM elements
        const container = { innerHTML: '', style: {} };
        const title = { textContent: '' };
        const price = { setAttribute: jest.fn() };
        const desc = { textContent: '' };
        const img = { src: '', classList: { add: jest.fn(), remove: jest.fn() } };
        const vid = { src: '', classList: { add: jest.fn(), remove: jest.fn() }, pause: jest.fn(), play: jest.fn().mockResolvedValue() };

        document.getElementById.mockImplementation((id) => {
            const el = {
                innerHTML: '',
                addEventListener: jest.fn(),
                style: {},
                textContent: '',
                setAttribute: jest.fn(),
                classList: { add: jest.fn(), remove: jest.fn() },
                remove: jest.fn(),
                appendChild: jest.fn(),
                pause: jest.fn(),
                play: jest.fn().mockResolvedValue(),
                nextElementSibling: { classList: { add: jest.fn(), remove: jest.fn() } }
            };
            if (id === 'details-container') return container;
            if (id === 'vehicle-title') return title;
            if (id === 'vehicle-title-crumb') return title;
            if (id === 'vehicle-price') return price;
            if (id === 'vehicle-desc') return desc;
            if (id === 'main-image') return img;
            if (id === 'main-video') return vid;
            if (id === 'spec-mileage') return { textContent: '', style: {} };
            if (id === 'spec-trans') return { textContent: '', style: {} };
            if (id === 'spec-fuel') return { textContent: '', style: {} };
            if (id === 'vehicle-desc-wrapper') return { ...el, nextElementSibling: { classList: { add: jest.fn(), remove: jest.fn() } } };
            if (id === 'vehicle-desc-fade') return el;
            if (id === 'btn-favorite-details') return { ...el, querySelector: jest.fn().mockReturnValue(el) };
            return el;
        });
    });

    test('re-fetches products if empty and finds product', async () => {
        global.window.productsDb.getAll.mockResolvedValueOnce([{
            id: 1,
            name: 'Test Car',
            image_url: 'test.jpg'
        }]);

        // Execute
        await script.loadDetails();

        // Verify re-fetch attempt
        expect(console.warn).toHaveBeenCalledWith(expect.stringContaining('Products list empty'));
        expect(global.window.productsDb.getAll).toHaveBeenCalled();

        // Verify product found and rendered
        expect(document.getElementById).toHaveBeenCalledWith('vehicle-title');
    });

    test('renders not found if product id does not exist', async () => {
        window.location.search = '?id=999';

        await script.loadDetails();

        expect(console.error).toHaveBeenCalledWith(expect.stringContaining('Product ID 999 not found'));
        const container = document.getElementById('details-container');
        expect(container.innerHTML).toContain('Vehicle Not Found');
    });
});
