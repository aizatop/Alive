# AliveAgain - Инструкция по использованию Supabase

## ✅ Подключение завершено!

Ваш проект AliveAgain успешно подключен к Supabase с следующими данными:

### Учетные данные проекта:
- **Project URL**: https://wjtxswzeibngvwaanusd.supabase.co
- **Publish Key (Anon)**: sb_publishable_zuu5cnEHd9vosElaR1wGvw_432g_6Ih
- **Status**: ✅ Активен

---

## 📁 Созданные файлы

### 1. `.env.local` - Переменные окружения
Содержит конфигурацию Supabase для безопасного подключения.

```
VITE_SUPABASE_URL=https://wjtxswzeibngvwaanusd.supabase.co
VITE_SUPABASE_ANON_KEY=sb_publishable_zuu5cnEHd9vosElaR1wGvw_432g_6Ih
```

### 2. `supabase-client.js` - Клиент Supabase
Модульный JavaScript файл с готовыми функциями для:
- Аутентификация (регистрация, вход, выход)
- Управление профилем пользователя
- Запись посещений стран
- Функции дружбы и сообщений
- Real-time подписки

### 3. `index.html` - Обновленный HTML
Теперь включает интеграцию с Supabase для:
- Автоматической записи посещений при клике на видео
- Проверки подключения при загрузке

---

## 🚀 Как начать использовать

### Шаг 1: Проверка подключения
Откройте браузер, перейдите на сайт и откройте консоль (F12):
```
Вы должны увидеть:
✅ Supabase успешно подключен!
```

### Шаг 2: Создание таблиц в Supabase

Перейдите в [Supabase Console](https://app.supabase.com) и создайте таблицы:

#### Таблица: users
```sql
CREATE TABLE users (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  email VARCHAR(255) NOT NULL UNIQUE,
  username VARCHAR(100) NOT NULL,
  full_name VARCHAR(255),
  avatar_url TEXT,
  bio TEXT,
  age INT,
  country VARCHAR(100),
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);
```

#### Таблица: visits
```sql
CREATE TABLE visits (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  country VARCHAR(100) NOT NULL,
  visited_at TIMESTAMP DEFAULT NOW(),
  duration_minutes INT,
  impressions TEXT
);
```

#### Таблица: friends
```sql
CREATE TABLE friends (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  friend_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  status VARCHAR(50) DEFAULT 'pending',
  created_at TIMESTAMP DEFAULT NOW(),
  UNIQUE(user_id, friend_id)
);
```

#### Таблица: messages
```sql
CREATE TABLE messages (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  sender_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  recipient_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  content TEXT NOT NULL,
  created_at TIMESTAMP DEFAULT NOW(),
  is_read BOOLEAN DEFAULT FALSE
);
```

---

## 💻 Примеры использования

### Регистрация пользователя
```javascript
import { signUp } from './supabase-client.js'

const result = await signUp('user@example.com', 'password123', 'username')
if (result.success) {
  console.log('✅ Пользователь зарегистрирован:', result.user)
} else {
  console.error('❌ Ошибка:', result.error)
}
```

### Вход в систему
```javascript
import { signIn } from './supabase-client.js'

const result = await signIn('user@example.com', 'password123')
if (result.success) {
  console.log('✅ Вход успешен')
}
```

### Запись посещения страны
```javascript
import { recordVisit } from './supabase-client.js'

const result = await recordVisit(userId, 'Япония', 30)
if (result.success) {
  console.log('✅ Посещение записано')
}
```

### Получение профиля пользователя
```javascript
import { getUserProfile } from './supabase-client.js'

const result = await getUserProfile(userId)
if (result.success) {
  console.log('Профиль:', result.profile)
}
```

### Отправка сообщения
```javascript
import { sendMessage } from './supabase-client.js'

const result = await sendMessage(senderId, recipientId, 'Привет!')
if (result.success) {
  console.log('✅ Сообщение отправлено')
}
```

### Real-time подписка на сообщения
```javascript
import { subscribeToMessages } from './supabase-client.js'

const subscription = subscribeToMessages(userId, (message) => {
  console.log('📨 Новое сообщение:', message)
})

// Отписка когда больше не нужна
subscription.unsubscribe()
```

---

## 🔒 Безопасность

### ⚠️ ВАЖНО!

**НИКОГДА** не публикуйте Secret Key в GitHub или интернете!

✅ **Безопасно:**
- Public Key (Anon Key) в коде - МОЖНО
- Environment variables - ХОРОШО
- .env.local файл в .gitignore - ОБЯЗАТЕЛЬНО

❌ **ОПАСНО:**
- Secret Key в коде - ЗАПРЕЩЕНО
- Secret Key в GitHub - ЗАПРЕЩЕНО
- Secret Key в публичных местах - ЗАПРЕЩЕНО

### Добавьте .env.local в .gitignore
```bash
echo ".env.local" >> .gitignore
```

---

## 🔐 Row Level Security (RLS)

Для защиты данных пользователей, включите RLS в Supabase:

1. Перейдите в **SQL Editor** в Supabase Console
2. Выполните следующие команды:

```sql
-- Включите RLS для таблицы users
ALTER TABLE users ENABLE ROW LEVEL SECURITY;

-- Пользователь может видеть только свой профиль
CREATE POLICY "Users can view own profile"
ON users
FOR SELECT
USING (auth.uid() = id);

-- Пользователь может обновлять только свой профиль
CREATE POLICY "Users can update own profile"
ON users
FOR UPDATE
USING (auth.uid() = id);
```

---

## 🧪 Тестирование

### Проверка подключения в консоли браузера:
```javascript
import { supabase } from './supabase-client.js'

// Проверка статуса
const { data, error } = await supabase.from('users').select('count').limit(1)
console.log('Статус:', error ? '❌ Ошибка' : '✅ OK')
```

---

## 📚 Полезные ссылки

- 🔗 [Supabase Console](https://app.supabase.com)
- 📖 [Документация Supabase](https://supabase.com/docs)
- 🔐 [Authentication Docs](https://supabase.com/docs/guides/auth)
- 🚀 [Realtime Docs](https://supabase.com/docs/guides/realtime)

---

## 🆘 Часто встречающиеся проблемы

### Проблема: CORS ошибка
**Решение**: Проверьте, что ваш домен добавлен в Supabase Settings → Auth → Redirect URLs

### Проблема: "No rows found"
**Решение**: Убедитесь, что таблицы созданы и RLS политики установлены правильно

### Проблема: Ключ не работает
**Решение**: Используйте Public Key (Anon Key), а не Secret Key

---

## 📝 Следующие шаги

1. ✅ Создайте таблицы в базе данных
2. ✅ Включите RLS для безопасности
3. ✅ Тестируйте функции в консоли браузера
4. ✅ Интегрируйте с вашим приложением
5. ✅ Развертывайте на хостинге (Vercel, Netlify)

---

**AliveAgain © 2026** | Powered by Supabase ✨
