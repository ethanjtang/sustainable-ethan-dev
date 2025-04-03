"use client";
import React, { useState, useEffect } from 'react';
import styles from './page.module.css';
import Layout from './glossary_layout'
import { useRouter } from 'next/navigation';

const HomePage: React.FC = () => {
  type GlossarySection = {
    title: string;
    terms: string[];
  };
  const router = useRouter();
  
  type GlossaryTerm = string;

  const [glossaryTerms, setGlossaryTerms] = useState<GlossarySection[]>([]);
  const [searchResults, setSearchResults] = useState<GlossaryTerm[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  
  const [isTooltipActive, setIsTooltipActive] = useState(false);

  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Existing data fetching logic
    if (typeof window !== 'undefined') {
      setIsLoading(true);
      fetch('http://127.0.0.1:5000/api/glossary')
        .then(response => response.json())
        .then(data => {
          const formattedSections = Object.entries(data).map(([key, terms]) => ({
            title: key,
            terms: terms as string[],
          }));
  
          const sortedSections = formattedSections.sort((a, b) => {
            if (a.title.toLowerCase() === "numbers & others") return -1;
            if (b.title.toLowerCase() === "numbers & others") return 1;
            return a.title.localeCompare(b.title);
          });
  
          setGlossaryTerms(sortedSections);
        })
        .catch(error => {
          console.error('Error fetching glossary terms:', error);
          setGlossaryTerms([]);
        })
        .finally(() => {
          setIsLoading(false);
        });
    }

    // Add event listener for page visibility changes
    const handleVisibilityChange = () => {
      if (document.visibilityState === 'visible') {
        // Reset search state when page becomes visible again (after back navigation)
        setSearchQuery('');
        setSearchResults([]);
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);
    
    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, []);
  

const handleSearch = (query: string) => {
  setSearchQuery(query);

  if (query) {
    fetch(`http://127.0.0.1:5000/api/search?query=${query}`)
      .then((response) => {
        if (!response.ok) {
          throw new Error("Failed to fetch search results");
        }
        return response.json();
      })
      .then((data) => {
        console.log("Search Results API Response:", data);
        if (Array.isArray(data)) {
          setSearchResults(data);
        } else {
          throw new Error("Invalid data format from API");
        }
      })
      .catch((error) => {
        console.error("Error searching terms:", error);
        setSearchResults([]);
      });
  } else {
    setSearchResults([]);
  }
};
  

const showDefinition = (term: string) => {
  router.push(`/glossary/definition?term=${encodeURIComponent(term)}`);
};

  

  const toggleTooltip = () => {
    setIsTooltipActive(!isTooltipActive);
  };



  return (
    <Layout>
      <div className={styles.body}>
        <h1 className={styles.heading1}>House Sustainability Tips</h1>
        <h3 className={styles.heading3}> </h3>
        <h4 className={styles.centerText}>
        For the best results in the Glossary search, we recommend using any familiar term, such as Alexa, Greenhouse gases, or other individual terms.
        </h4>

        <h3 className={styles.heading3}> </h3>

        <input
          type="text"
          id="search-bar"
          placeholder="Search glossary terms..."
          value={searchQuery}
          onChange={(e) => handleSearch(e.target.value)}
          className={styles.searchBar}
        />

        <h3 className={styles.heading3}> </h3>

        <p className={styles.centerText}>
  Visit the official website for more information: <a href="https://greenifyai.com" target="_blank" rel="noopener noreferrer" className={styles.link}>greenifyai.com</a>
</p>

<div className={`${styles.hoverText} ${styles.centerText} `} onClick={toggleTooltip}>
  <p>Need help getting started?</p>
  <span className={`${styles.tooltip} ${isTooltipActive ? styles.active : ''}`}>
    <p>Here&apos;s how to use the glossary:</p>
    <br />
    • Search for terms<br />
    • Browse categories<br />
    • Click on any term to see its definition!
  </span>
</div>

        <div id="sections-container" className={styles.sectionsContainer}>
          {isLoading ? (
    <div className={styles.loadingPlaceholder}>
      Loading glossary terms...
    </div>
  ) : (
    <>
          {/* Conditionally render the sections container */}
          <div
            id="sections"
            className={styles.sections}
            style={{ display: searchQuery.length > 0 ? 'none' : 'flex' }}
          >
            {glossaryTerms.map((section, index) => (
              <div key={index} className={styles.section}>
                <div className={styles.sectionTitle}>{section.title}</div>
                <ul className={styles.sectionList}>
                  {section.terms.map((term: string, idx: number) => (
                    <li
                      key={idx}
                      className={styles.sectionItem}
                      onClick={() => showDefinition(term)}
                    >
                      {term}
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>

          {/* Conditionally render the results container */}
          <ul
            id="results"
            className={styles.results}
            style={{ display: searchQuery.length > 0 ? 'block' : 'none' }}
          >
            {searchResults.length > 0 ? (
              searchResults.map((result, index) => (
                <li
                  key={index}
                  className={styles.resultItem}
                  onClick={() => showDefinition(result)}
                >
                  {result}
                </li>
              ))
            ) : searchQuery.length > 0 ? (
              <li className={styles.noResults}>No results found.</li>
            ) : (
              <li className={styles.noResults}>Type to search...</li>
            )}
          </ul>

        </>
  )}
</div>

       
      </div>
    </Layout>
  );
};


export default HomePage;
