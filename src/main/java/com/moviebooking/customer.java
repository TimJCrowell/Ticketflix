package com.moviebooking;

import java.util.Objects;
import java.time.LocalDate;

public class Customer
{
    private long id;
    private String name;
    private LocalDate dob; //date of birth

    public Customer()
    {
    }

    public Customer(String name, LocalDate dob)
    {
        this.name = name;
        this.dob = dob;
    }

    public long getId()
    {
        return id;
    }

    public void setId(Long id)
    {
        this.id = id;
    }

    public String getName()
    {
        return name;
    }

    public void setName(String name)
    {
        this.name = name;
    }

    public LocalDate getDob()
    {
        return dob;
    }

    public void setDob(LocalDate dob)
    {
        this.dob = dob;
    }
}//end customer class