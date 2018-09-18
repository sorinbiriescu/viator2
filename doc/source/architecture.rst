Architecture
===================================

The backend and the frontend of the application will be divided and kept separated as much as possible.
Preferably, the only way that the 2 will communicate is throught APIs and initial page servings.

.. warning:: The development of the application will be TDD, no exceptions.

Backend
*******

The backend of the application is in Python - Flask with SQLAlchemy.
The DB is PostgreSQL. The main reason for this is their awesome GEO plugins for point retrieval, path generation etc. Plays well with python and SQLAlchemy.

Frontend
********

Frontend will be HMTL with Foundation CSS, JS.