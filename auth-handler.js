// ============================================
// SUPABASE CONFIGURATION
// Sizin vereceğiniz bağlantı kodlarını buraya eklemelisiniz.
// ============================================
const SUPABASE_URL = 'https://aisacybdvfuilkqypikw.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImFpc2FjeWJkdmZ1aWxrcXlwaWt3Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzYzMjAwODMsImV4cCI6MjA5MTg5NjA4M30.f9OwRTZkSy6iQFAfC9ydEN67dBZrK9deFSxRdpFnG7k';

// Admin olarak belirlenecek hesap
const ADMIN_EMAIL = 'admin@banucafe.com';

let banuSupabase;
try {
    banuSupabase = window.supabase ? window.supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY) : null;
} catch (error) {
    console.error("Supabase initialize hatası:", error);
}

// ============================================
// UI TOGGLE MANTIĞI
// ============================================
function switchMode(mode) {
    const loginForm = document.getElementById('login-form');
    const registerForm = document.getElementById('register-form');
    const toggleLogin = document.getElementById('toggle-login');
    const toggleRegister = document.getElementById('toggle-register');
    const alertBox = document.getElementById('alert-box');

    alertBox.classList.add('hidden'); // Clear alerts on switch

    if (mode === 'login') {
        loginForm.classList.remove('hidden');
        registerForm.classList.add('hidden');

        toggleLogin.classList.add('bg-white', 'text-forest', 'shadow-sm');
        toggleLogin.classList.remove('text-forest/50');

        toggleRegister.classList.remove('bg-white', 'text-forest', 'shadow-sm');
        toggleRegister.classList.add('text-forest/50');
    } else {
        registerForm.classList.remove('hidden');
        loginForm.classList.add('hidden');

        toggleRegister.classList.add('bg-white', 'text-forest', 'shadow-sm');
        toggleRegister.classList.remove('text-forest/50');

        toggleLogin.classList.remove('bg-white', 'text-forest', 'shadow-sm');
        toggleLogin.classList.add('text-forest/50');
    }
}

function showAlert(message, type = 'error') {
    const alertBox = document.getElementById('alert-box');
    alertBox.textContent = message;
    alertBox.classList.remove('hidden', 'bg-red-100', 'text-red-700', 'bg-green-100', 'text-green-700');

    if (type === 'error') {
        alertBox.classList.add('bg-red-100', 'text-red-700');
    } else {
        alertBox.classList.add('bg-green-100', 'text-green-700');
    }
}

// ============================================
// BÜTÜNLEŞİK KİMLİK DOĞRULAMA (AUTH) FONKSİYONU
// ============================================
async function handleAuth(e, mode) {
    e.preventDefault();
    const alertBox = document.getElementById('alert-box');
    alertBox.classList.add('hidden');

    // Butonu yükleniyor yap
    const btn = e.target.querySelector('button[type="submit"]');
    const originalText = btn.innerHTML;
    btn.innerHTML = 'Lütfen bekleyin...';
    btn.disabled = true;

    try {
        if (mode === 'register') {
            const email = document.getElementById('register-email').value;
            const password = document.getElementById('register-password').value;
            const name = document.getElementById('register-name').value;

            const { data, error } = await banuSupabase.auth.signUp({
                email: email,
                password: password,
                options: {
                    data: {
                        full_name: name
                    }
                }
            });

            if (error) throw error;

            showAlert('Kayıt başarılı! Giriş sayfasına yönlendiriliyorsunuz...', 'success');
            setTimeout(() => switchMode('login'), 2000);

        } else if (mode === 'login') {
            const email = document.getElementById('login-email').value;
            const password = document.getElementById('login-password').value;

            const { data, error } = await banuSupabase.auth.signInWithPassword({
                email: email,
                password: password
            });

            if (error) throw error;

            // Admin kontrolü
            if (email === ADMIN_EMAIL) {
                window.location.href = 'admin.html';
            } else {
                window.location.href = 'index.html';
            }
        }
    } catch (error) {
        console.error("Detaylı Auth Hatası:", error);
        
        let errorMsg = error.message || 'Bir hata oluştu.';
        if (error.message && error.message.includes('Invalid login credentials')) errorMsg = 'E-posta veya şifre hatalı.';
        if (error.message && error.message.includes('Password should be')) errorMsg = 'Şifreniz en az 6 karakter olmalıdır.';
        if (error.message && error.message.includes('User already registered')) errorMsg = 'Bu e-posta adresi sistemde zaten kayıtlı.';
        if (error.message && error.message.includes('Email not confirmed')) errorMsg = 'Giriş yapabilmek için e-posta adresinizi onaylamanız gerekmektedir (Supabase ayarlarından onayı kapatabilirsiniz).';
        
        showAlert(errorMsg, 'error');
    } finally {
        btn.innerHTML = originalText;
        btn.disabled = false;
    }
}

// Sayfa yüklendiğinde oturum açık mı kontrol et ve Header'ı güncelle
document.addEventListener('DOMContentLoaded', async () => {
    try {
        const { data: { session } } = await banuSupabase.auth.getSession();
        const currentPath = window.location.pathname;

        // Auth sayfasındaysak ve zaten giriş yapılmışsa yönlendir
        if (session && currentPath.includes('auth.html')) {
            if (session.user.email === ADMIN_EMAIL) {
                window.location.href = 'admin.html';
            } else {
                window.location.href = 'index.html';
            }
            return;
        }

        // Header butonlarını güncelleme (Tüm sayfalarda varsayıyoruz)
        if (session) {
            const userName = session.user.user_metadata?.full_name || 'Hesabım';
            const desktopLoginBtn = document.getElementById('btn-login');
            const mobileLoginBtn = document.getElementById('mobile-btn-login'); // Mobil için
            
            const isAdmin = session.user.email === ADMIN_EMAIL;
            
            if (desktopLoginBtn) {
                desktopLoginBtn.textContent = `👋 ${userName} (Çıkış)`;
                desktopLoginBtn.href = "#";
                desktopLoginBtn.onclick = handleLogoutClick;
                
                // Desktop Navbar İçin Admin Linki Ekleme
                if (isAdmin && !document.getElementById('desktop-admin-link')) {
                    const adminLink = document.createElement('a');
                    adminLink.id = 'desktop-admin-link';
                    adminLink.href = 'admin.html';
                    adminLink.className = 'px-4 py-2.5 rounded-full text-sm font-semibold bg-forest text-white transition-all shadow-md ml-3 border border-forest/10 hover:bg-forest/90';
                    adminLink.innerHTML = '<span class="flex items-center gap-2"><svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z"></path><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"></path></svg> Admin Paneli</span>';
                    
                    desktopLoginBtn.parentNode.insertBefore(adminLink, desktopLoginBtn);
                }
            }

            if (mobileLoginBtn) {
                mobileLoginBtn.textContent = `👋 ${userName} (Çıkış)`;
                mobileLoginBtn.href = "#";
                mobileLoginBtn.onclick = handleLogoutClick;
                mobileLoginBtn.classList.replace('border-forest-700/20', 'border-red-200');
                mobileLoginBtn.classList.replace('hover:border-gold', 'text-red-500');

                // Mobil Navbar İçin Admin Linki Ekleme
                if (isAdmin && !document.getElementById('mobile-admin-link')) {
                    const adminLink = document.createElement('a');
                    adminLink.id = 'mobile-admin-link';
                    adminLink.href = 'admin.html';
                    adminLink.className = 'text-center text-sm font-medium py-2.5 rounded-full bg-forest text-white hover:bg-forest/90 transition-colors shadow-sm';
                    adminLink.innerHTML = 'Admin Paneli';
                    mobileLoginBtn.parentNode.insertBefore(adminLink, mobileLoginBtn);
                }
            }
        }
    } catch (e) {
        console.warn("Supabase auth check error:", e);
    }
});

async function handleLogoutClick(e) {
    e.preventDefault();
    await banuSupabase.auth.signOut();
    window.location.reload();
}

// Global Sipariş Fonksiyonu (Müşteriler İçin)
window.orderCoffee = async function(productName, price) {
    try {
        const { data: { session } } = await banuSupabase.auth.getSession();
        
        if (!session) {
            alert('Sipariş verebilmek için lütfen giriş yapın veya kayıt olun!');
            window.location.href = 'auth.html';
            return;
        }

        if (confirm(`"${productName}" siparişini ₺${price} tutarında onaylıyor musunuz?`)) {
            const customerName = session.user.user_metadata?.full_name || session.user.email;
            
            const { error } = await banuSupabase.from('orders').insert([{
                user_id: session.user.id,
                customer_name: customerName,
                total_amount: price,
                status: 'Hazırlanıyor'
            }]);

            if (error) throw error;
            alert('Siparişiniz başarıyla alındı! Teşekkür ederiz.');
        }

    } catch (error) {
        console.error('Sipariş hatası:', error);
        alert('Sipariş verirken bir hata oluştu. Lütfen tekrar deneyin.');
    }
}

