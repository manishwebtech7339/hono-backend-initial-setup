Layer Responsibilities (Very Important)
Route → Controller → Service → Repository → Database
1. Routes

Define endpoints

Attach validation & middleware

No business logic

2. Controller

Handle request/response

Call service

No DB logic

3. Service

Business rules

Combine multiple repositories

Reusable logic

4. Repository

Only SQL / DB queries

No request objects

Easy to optimize later