# مينا بيزنس - Mena Business (Desktop App)

هذا المشروع هو نظام متكامل لإدارة المبيعات والمخازن، تم تحويله إلى تطبيق سطح مكتب يعمل بنظام Electron.js مع قاعدة بيانات SQLite محلية.

## محتويات المشروع
- **Frontend**: React + Vite + Tailwind CSS.
- **Backend**: Express.js + SQLite (Better-SQLite3).
- **Desktop Wrapper**: Electron.js.
- **Database**: `mena_business.db`.

## متطلبات التشغيل
- يجب أن يكون مثبتًا على جهازك **Node.js** (إصدار 18 أو أحدث).

## كيفية التشغيل (Development)
1. قم بفك ضغط الملف في مجلد مستقل.
2. افتح نافذة الأوامر (Terminal/CMD) داخل المجلد.
3. قم بتثبيت المكتبات المطلوبة:
   ```bash
   npm install
   ```
4. لتشغيل البرنامج في وضع التطوير (Desktop):
   ```bash
   npm run electron
   ```

## كيفية بناء نسخة التنفيذ (Build .exe)
لبناء ملف التثبيت الخاص بـ Windows:
```bash
npm run dist
```
بعد الانتهاء، ستجد ملف `MenaBusinessSetup.exe` داخل مجلد `dist`.

## المميزات الاحترافية
- **العمل بدون إنترنت**: جميع البيانات تُحفظ محلياً.
- **شاشة ترحيب (Splash Screen)**: تظهر عند فتح البرنامج.
- **حفظ تلقائي**: قاعدة البيانات تقوم بحفظ العمليات فورياً.
- **أمان**: حماية صلاحيات المستخدمين ومنع الدخول لغير المصرح لهم.

---

# Mena Business (Desktop App)

This project is a comprehensive Sales and Inventory Management System, converted into a desktop application using Electron.js with a local SQLite database.

## Project Contents
- **Frontend**: React + Vite + Tailwind CSS.
- **Backend**: Express.js + SQLite (Better-SQLite3).
- **Desktop Wrapper**: Electron.js.
- **Database**: `mena_business.db`.

## Requirements
- **Node.js** (v18 or newer) must be installed on your machine.

## How to Run (Development)
1. Extract the ZIP file into a folder.
2. Open the Terminal/CMD in that folder.
3. Install dependencies:
   ```bash
   npm install
   ```
4. Run the desktop application:
   ```bash
   npm run electron
   ```

## How to Build (.exe)
To generate the Windows Installer:
```bash
npm run dist
```
The installer `MenaBusinessSetup.exe` will be located in the `dist` directory.

## Professional Features
- **Offline First**: All data is stored locally.
- **Splash Screen**: Professional loading experience.
- **Auto-Save**: Instant data persistence.
- **Security**: Role-based access control.
