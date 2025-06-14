PGDMP  +                    }            medicalmnemonics    17.5    17.5 2    �           0    0    ENCODING    ENCODING        SET client_encoding = 'UTF8';
                           false            �           0    0 
   STDSTRINGS 
   STDSTRINGS     (   SET standard_conforming_strings = 'on';
                           false            �           0    0 
   SEARCHPATH 
   SEARCHPATH     8   SELECT pg_catalog.set_config('search_path', '', false);
                           false                        1262    16388    medicalmnemonics    DATABASE     �   CREATE DATABASE medicalmnemonics WITH TEMPLATE = template0 ENCODING = 'UTF8' LOCALE_PROVIDER = libc LOCALE = 'English_United States.1252';
     DROP DATABASE medicalmnemonics;
                     postgres    false            �            1259    16420 	   libraries    TABLE     �   CREATE TABLE public.libraries (
    id integer NOT NULL,
    user_id integer,
    name character varying(255) NOT NULL,
    created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP
);
    DROP TABLE public.libraries;
       public         heap r       postgres    false            �            1259    16419    libraries_id_seq    SEQUENCE     �   CREATE SEQUENCE public.libraries_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;
 '   DROP SEQUENCE public.libraries_id_seq;
       public               postgres    false    222                       0    0    libraries_id_seq    SEQUENCE OWNED BY     E   ALTER SEQUENCE public.libraries_id_seq OWNED BY public.libraries.id;
          public               postgres    false    221            �            1259    16432    library_mnemonics    TABLE     m   CREATE TABLE public.library_mnemonics (
    library_id integer NOT NULL,
    mnemonic_id integer NOT NULL
);
 %   DROP TABLE public.library_mnemonics;
       public         heap r       postgres    false            �            1259    16404 	   mnemonics    TABLE     �  CREATE TABLE public.mnemonics (
    id integer NOT NULL,
    user_id integer,
    created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
    updated_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
    category character varying(255),
    difficulty character varying(50),
    body_system character varying(255),
    exam_relevance character varying(255),
    tags text[],
    acronym character varying(255),
    full_form text
);
    DROP TABLE public.mnemonics;
       public         heap r       postgres    false            �            1259    16403    mnemonics_id_seq    SEQUENCE     �   CREATE SEQUENCE public.mnemonics_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;
 '   DROP SEQUENCE public.mnemonics_id_seq;
       public               postgres    false    220                       0    0    mnemonics_id_seq    SEQUENCE OWNED BY     E   ALTER SEQUENCE public.mnemonics_id_seq OWNED BY public.mnemonics.id;
          public               postgres    false    219            �            1259    16448    user_mnemonic_stats    TABLE     T  CREATE TABLE public.user_mnemonic_stats (
    id integer NOT NULL,
    user_id integer,
    mnemonic_id integer,
    correct_count integer DEFAULT 0,
    incorrect_count integer DEFAULT 0,
    ease_factor numeric(3,2) DEFAULT 2.5,
    "interval" integer DEFAULT 1,
    last_reviewed timestamp without time zone DEFAULT CURRENT_TIMESTAMP
);
 '   DROP TABLE public.user_mnemonic_stats;
       public         heap r       postgres    false            �            1259    16447    user_mnemonic_stats_id_seq    SEQUENCE     �   CREATE SEQUENCE public.user_mnemonic_stats_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;
 1   DROP SEQUENCE public.user_mnemonic_stats_id_seq;
       public               postgres    false    225                       0    0    user_mnemonic_stats_id_seq    SEQUENCE OWNED BY     Y   ALTER SEQUENCE public.user_mnemonic_stats_id_seq OWNED BY public.user_mnemonic_stats.id;
          public               postgres    false    224            �            1259    16470    user_progress    TABLE     �   CREATE TABLE public.user_progress (
    id integer NOT NULL,
    user_id integer,
    correct_answers integer DEFAULT 0,
    total_answers integer DEFAULT 0,
    last_updated timestamp without time zone DEFAULT CURRENT_TIMESTAMP
);
 !   DROP TABLE public.user_progress;
       public         heap r       postgres    false            �            1259    16469    user_progress_id_seq    SEQUENCE     �   CREATE SEQUENCE public.user_progress_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;
 +   DROP SEQUENCE public.user_progress_id_seq;
       public               postgres    false    227                       0    0    user_progress_id_seq    SEQUENCE OWNED BY     M   ALTER SEQUENCE public.user_progress_id_seq OWNED BY public.user_progress.id;
          public               postgres    false    226            �            1259    16390    users    TABLE     �   CREATE TABLE public.users (
    id integer NOT NULL,
    email character varying(255) NOT NULL,
    password character varying(255) NOT NULL,
    created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP
);
    DROP TABLE public.users;
       public         heap r       postgres    false            �            1259    16389    users_id_seq    SEQUENCE     �   CREATE SEQUENCE public.users_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;
 #   DROP SEQUENCE public.users_id_seq;
       public               postgres    false    218                       0    0    users_id_seq    SEQUENCE OWNED BY     =   ALTER SEQUENCE public.users_id_seq OWNED BY public.users.id;
          public               postgres    false    217            >           2604    16423    libraries id    DEFAULT     l   ALTER TABLE ONLY public.libraries ALTER COLUMN id SET DEFAULT nextval('public.libraries_id_seq'::regclass);
 ;   ALTER TABLE public.libraries ALTER COLUMN id DROP DEFAULT;
       public               postgres    false    222    221    222            ;           2604    16407    mnemonics id    DEFAULT     l   ALTER TABLE ONLY public.mnemonics ALTER COLUMN id SET DEFAULT nextval('public.mnemonics_id_seq'::regclass);
 ;   ALTER TABLE public.mnemonics ALTER COLUMN id DROP DEFAULT;
       public               postgres    false    220    219    220            @           2604    16451    user_mnemonic_stats id    DEFAULT     �   ALTER TABLE ONLY public.user_mnemonic_stats ALTER COLUMN id SET DEFAULT nextval('public.user_mnemonic_stats_id_seq'::regclass);
 E   ALTER TABLE public.user_mnemonic_stats ALTER COLUMN id DROP DEFAULT;
       public               postgres    false    225    224    225            F           2604    16473    user_progress id    DEFAULT     t   ALTER TABLE ONLY public.user_progress ALTER COLUMN id SET DEFAULT nextval('public.user_progress_id_seq'::regclass);
 ?   ALTER TABLE public.user_progress ALTER COLUMN id DROP DEFAULT;
       public               postgres    false    226    227    227            9           2604    16393    users id    DEFAULT     d   ALTER TABLE ONLY public.users ALTER COLUMN id SET DEFAULT nextval('public.users_id_seq'::regclass);
 7   ALTER TABLE public.users ALTER COLUMN id DROP DEFAULT;
       public               postgres    false    218    217    218            �          0    16420 	   libraries 
   TABLE DATA           B   COPY public.libraries (id, user_id, name, created_at) FROM stdin;
    public               postgres    false    222   X>       �          0    16432    library_mnemonics 
   TABLE DATA           D   COPY public.library_mnemonics (library_id, mnemonic_id) FROM stdin;
    public               postgres    false    223   u>       �          0    16404 	   mnemonics 
   TABLE DATA           �   COPY public.mnemonics (id, user_id, created_at, updated_at, category, difficulty, body_system, exam_relevance, tags, acronym, full_form) FROM stdin;
    public               postgres    false    220   �>       �          0    16448    user_mnemonic_stats 
   TABLE DATA           �   COPY public.user_mnemonic_stats (id, user_id, mnemonic_id, correct_count, incorrect_count, ease_factor, "interval", last_reviewed) FROM stdin;
    public               postgres    false    225   �@       �          0    16470    user_progress 
   TABLE DATA           b   COPY public.user_progress (id, user_id, correct_answers, total_answers, last_updated) FROM stdin;
    public               postgres    false    227   �A       �          0    16390    users 
   TABLE DATA           @   COPY public.users (id, email, password, created_at) FROM stdin;
    public               postgres    false    218   �A                  0    0    libraries_id_seq    SEQUENCE SET     ?   SELECT pg_catalog.setval('public.libraries_id_seq', 1, false);
          public               postgres    false    221                       0    0    mnemonics_id_seq    SEQUENCE SET     ?   SELECT pg_catalog.setval('public.mnemonics_id_seq', 11, true);
          public               postgres    false    219                       0    0    user_mnemonic_stats_id_seq    SEQUENCE SET     H   SELECT pg_catalog.setval('public.user_mnemonic_stats_id_seq', 7, true);
          public               postgres    false    224            	           0    0    user_progress_id_seq    SEQUENCE SET     C   SELECT pg_catalog.setval('public.user_progress_id_seq', 1, false);
          public               postgres    false    226            
           0    0    users_id_seq    SEQUENCE SET     :   SELECT pg_catalog.setval('public.users_id_seq', 2, true);
          public               postgres    false    217            Q           2606    16426    libraries libraries_pkey 
   CONSTRAINT     V   ALTER TABLE ONLY public.libraries
    ADD CONSTRAINT libraries_pkey PRIMARY KEY (id);
 B   ALTER TABLE ONLY public.libraries DROP CONSTRAINT libraries_pkey;
       public                 postgres    false    222            S           2606    16436 (   library_mnemonics library_mnemonics_pkey 
   CONSTRAINT     {   ALTER TABLE ONLY public.library_mnemonics
    ADD CONSTRAINT library_mnemonics_pkey PRIMARY KEY (library_id, mnemonic_id);
 R   ALTER TABLE ONLY public.library_mnemonics DROP CONSTRAINT library_mnemonics_pkey;
       public                 postgres    false    223    223            O           2606    16413    mnemonics mnemonics_pkey 
   CONSTRAINT     V   ALTER TABLE ONLY public.mnemonics
    ADD CONSTRAINT mnemonics_pkey PRIMARY KEY (id);
 B   ALTER TABLE ONLY public.mnemonics DROP CONSTRAINT mnemonics_pkey;
       public                 postgres    false    220            U           2606    16458 ,   user_mnemonic_stats user_mnemonic_stats_pkey 
   CONSTRAINT     j   ALTER TABLE ONLY public.user_mnemonic_stats
    ADD CONSTRAINT user_mnemonic_stats_pkey PRIMARY KEY (id);
 V   ALTER TABLE ONLY public.user_mnemonic_stats DROP CONSTRAINT user_mnemonic_stats_pkey;
       public                 postgres    false    225            W           2606    16478     user_progress user_progress_pkey 
   CONSTRAINT     ^   ALTER TABLE ONLY public.user_progress
    ADD CONSTRAINT user_progress_pkey PRIMARY KEY (id);
 J   ALTER TABLE ONLY public.user_progress DROP CONSTRAINT user_progress_pkey;
       public                 postgres    false    227            K           2606    16402    users users_email_key 
   CONSTRAINT     Q   ALTER TABLE ONLY public.users
    ADD CONSTRAINT users_email_key UNIQUE (email);
 ?   ALTER TABLE ONLY public.users DROP CONSTRAINT users_email_key;
       public                 postgres    false    218            M           2606    16398    users users_pkey 
   CONSTRAINT     N   ALTER TABLE ONLY public.users
    ADD CONSTRAINT users_pkey PRIMARY KEY (id);
 :   ALTER TABLE ONLY public.users DROP CONSTRAINT users_pkey;
       public                 postgres    false    218            Y           2606    16427     libraries libraries_user_id_fkey    FK CONSTRAINT        ALTER TABLE ONLY public.libraries
    ADD CONSTRAINT libraries_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.users(id);
 J   ALTER TABLE ONLY public.libraries DROP CONSTRAINT libraries_user_id_fkey;
       public               postgres    false    218    4685    222            Z           2606    16437 3   library_mnemonics library_mnemonics_library_id_fkey    FK CONSTRAINT     �   ALTER TABLE ONLY public.library_mnemonics
    ADD CONSTRAINT library_mnemonics_library_id_fkey FOREIGN KEY (library_id) REFERENCES public.libraries(id);
 ]   ALTER TABLE ONLY public.library_mnemonics DROP CONSTRAINT library_mnemonics_library_id_fkey;
       public               postgres    false    223    222    4689            [           2606    16442 4   library_mnemonics library_mnemonics_mnemonic_id_fkey    FK CONSTRAINT     �   ALTER TABLE ONLY public.library_mnemonics
    ADD CONSTRAINT library_mnemonics_mnemonic_id_fkey FOREIGN KEY (mnemonic_id) REFERENCES public.mnemonics(id);
 ^   ALTER TABLE ONLY public.library_mnemonics DROP CONSTRAINT library_mnemonics_mnemonic_id_fkey;
       public               postgres    false    4687    220    223            X           2606    16414     mnemonics mnemonics_user_id_fkey    FK CONSTRAINT        ALTER TABLE ONLY public.mnemonics
    ADD CONSTRAINT mnemonics_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.users(id);
 J   ALTER TABLE ONLY public.mnemonics DROP CONSTRAINT mnemonics_user_id_fkey;
       public               postgres    false    4685    220    218            \           2606    16464 8   user_mnemonic_stats user_mnemonic_stats_mnemonic_id_fkey    FK CONSTRAINT     �   ALTER TABLE ONLY public.user_mnemonic_stats
    ADD CONSTRAINT user_mnemonic_stats_mnemonic_id_fkey FOREIGN KEY (mnemonic_id) REFERENCES public.mnemonics(id);
 b   ALTER TABLE ONLY public.user_mnemonic_stats DROP CONSTRAINT user_mnemonic_stats_mnemonic_id_fkey;
       public               postgres    false    4687    225    220            ]           2606    16459 4   user_mnemonic_stats user_mnemonic_stats_user_id_fkey    FK CONSTRAINT     �   ALTER TABLE ONLY public.user_mnemonic_stats
    ADD CONSTRAINT user_mnemonic_stats_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.users(id);
 ^   ALTER TABLE ONLY public.user_mnemonic_stats DROP CONSTRAINT user_mnemonic_stats_user_id_fkey;
       public               postgres    false    4685    218    225            ^           2606    16479 (   user_progress user_progress_user_id_fkey    FK CONSTRAINT     �   ALTER TABLE ONLY public.user_progress
    ADD CONSTRAINT user_progress_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.users(id);
 R   ALTER TABLE ONLY public.user_progress DROP CONSTRAINT user_progress_user_id_fkey;
       public               postgres    false    218    227    4685            �      x������ � �      �      x������ � �      �   I  x���Qo�0ǟͧ��&��61�<dU+M[��to�s$�`�4���>'YFIZԾ ����ww���1���/H�	�H�R��ܛ�.�Ί��W[�C��+�
���םA��_W8n����
�
��~S�����Ӣ_�\H����P�D	�2�	�#N��kS�O�4 r���ڢ��X��tf�uP��=����^�`�B���ۏԲ�,UlY��Fd��@� [�l�Ү
8�X�e��B�^�=$*Q�3CU��z��-�M�jQ���|וUm�l��!�P��N����l�ܵPۊ�4~Zr�keu��1���p�F��E̋sC�MIWǦ��*����b�����0��G\�yNI�h҇�#�R��d�,w�1e�i�.���MI����������	��զ��gg~�F����`ܞS��w~�	�T�i*Q��T:�	�,��\?$�ͦ��e4����g[����S��=��g�J����V�RNCJz�~�v���q(}EB)�4����]�qN�)�i|⇹^�8��ݥ�G�q�R][߼{�҆�G��nd���j�V�`��6q��!���      �   �   x�u��	�!��f�w��|�����ѳ��RjPAΫac���K,oR7ٗi{�&�\�N���o�z�tXgq��+��v`�L~YoQ�岔`�<�_00�EB�橁��*x;�|`���ΙsG�q��������|�NJ�����*�e��m��Ew&��W5      �      x������ � �      �   �   x����  �3<E���y*��:�:�]��Q����C�
���A����~��#��d%da�ǲ�eZ� ���M��2��{��;�E�&��O*c���"A�:��� o �c�Hzg��?`A#�     